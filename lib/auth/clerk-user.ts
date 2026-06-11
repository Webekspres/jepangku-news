import type { User } from '@clerk/backend';
import type { User as DbUser } from '@prisma/client';
import { db } from '@/lib/db';
import type { CoreJwtClaims } from '@/lib/core/session';
import { checkDailyLogin } from '@/lib/points';
import { toSessionUser } from './session';
import { slugifyUsername } from '@/lib/username';
import type { SessionUser } from './types';

function primaryEmail(clerkUser: User): string | null {
  const primary = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId,
  );
  return (primary ?? clerkUser.emailAddresses[0])?.emailAddress?.toLowerCase() ?? null;
}

function displayName(clerkUser: User, email: string): string {
  const parts = [clerkUser.firstName, clerkUser.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  if (clerkUser.username) return clerkUser.username;
  return email.split('@')[0] ?? 'User';
}

async function generateUniqueUsername(clerkUser: User, email: string): Promise<string> {
  const candidates = [
    clerkUser.username ? slugifyUsername(clerkUser.username) : '',
    slugifyUsername(email.split('@')[0] ?? 'user'),
  ].filter((c) => c.length >= 3);

  const base = candidates[0] || 'user';
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = attempt === 0 ? '' : `_${attempt}`;
    const username = `${base}${suffix}`.slice(0, 30);
    const existing = await db.user.findUnique({ where: { username } });
    if (!existing) return username;
  }

  return `user_${clerkUser.id.replace(/[^a-z0-9]/gi, '').slice(-8).toLowerCase()}`;
}

async function sessionUserFor(
  user: DbUser,
  coreClaims?: CoreJwtClaims | null,
): Promise<SessionUser> {
  const profile = await db.userProfile.findUnique({
    where: { userId: user.id },
    select: { displayName: true },
  });
  return toSessionUser(user, {
    profileDisplayName: profile?.displayName,
    coreClaims,
  });
}

async function loginSyncData(
  clerkUser: User,
  email: string,
  currentAvatarUrl: string | null,
  extra: Record<string, unknown> = {},
) {
  const profile = await db.userProfile.findUnique({
    where: { userId: clerkUser.id },
    select: { displayName: true },
  });

  return {
    email,
    avatarUrl: clerkUser.imageUrl ?? currentAvatarUrl,
    lastLoginAt: new Date(),
    ...(profile?.displayName ? { name: profile.displayName } : {}),
    ...extra,
  };
}

/** Repoint legacy/seed portal user PK to the Clerk ID (FKs use ON UPDATE CASCADE). */
async function relinkUserToClerkId(
  legacyUser: DbUser,
  clerkId: string,
  clerkUser: User,
  email: string,
): Promise<DbUser> {
  const legacyId = legacyUser.id;
  if (legacyId === clerkId) return legacyUser;

  console.info(
    `Clerk JIT: linking portal user ${legacyId} → ${clerkId} (${email})`,
  );

  return db.$transaction(async (tx) => {
    // No FK on these columns — update before PK change.
    await tx.$executeRaw`UPDATE quizzes SET created_by = ${clerkId} WHERE created_by = ${legacyId}`;
    await tx.$executeRaw`UPDATE polls SET created_by = ${clerkId} WHERE created_by = ${legacyId}`;

    await tx.$executeRaw`UPDATE users SET id = ${clerkId} WHERE id = ${legacyId}`;

    return tx.user.update({
      where: { id: clerkId },
      data: await loginSyncData(clerkUser, email, legacyUser.avatarUrl),
    });
  });
}

async function linkOrCreateLocalUser(
  clerkUser: User,
  coreClaims?: CoreJwtClaims | null,
): Promise<SessionUser> {
  const clerkId = clerkUser.id;
  const email = primaryEmail(clerkUser);

  if (!email) {
    throw new Error('Clerk user has no email address');
  }

  const byId = await db.user.findUnique({ where: { id: clerkId } });
  if (byId) {
    if (byId.status === 'banned') {
      throw new Error('Account is banned');
    }
    const updated = await db.user.update({
      where: { id: clerkId },
      data: await loginSyncData(clerkUser, email, byId.avatarUrl),
    });
    await checkDailyLogin(updated.id);
    const fresh = await db.user.findUnique({ where: { id: updated.id } });
    return sessionUserFor(fresh ?? updated, coreClaims);
  }

  const byEmail = await db.user.findUnique({ where: { email } });
  if (byEmail) {
    if (byEmail.status === 'banned') {
      throw new Error('Account is banned');
    }
    const linked = await relinkUserToClerkId(byEmail, clerkId, clerkUser, email);
    await checkDailyLogin(linked.id);
    return sessionUserFor(linked, coreClaims);
  }

  const username = await generateUniqueUsername(clerkUser, email);
  const name = displayName(clerkUser, email);

  const created = await db.user.create({
    data: {
      id: clerkId,
      email,
      username,
      name,
      avatarUrl: clerkUser.imageUrl,
      role: 'USER',
      status: 'active',
      lastLoginAt: new Date(),
      profile: {
        create: { displayName: name },
      },
    },
  });

  await checkDailyLogin(created.id);
  return sessionUserFor(created, coreClaims);
}

export async function ensureLocalUserFromClerk(
  clerkUser: User,
  coreClaims?: CoreJwtClaims | null,
): Promise<SessionUser> {
  return linkOrCreateLocalUser(clerkUser, coreClaims);
}

export async function getSessionUserByClerkId(
  clerkId: string,
  coreClaims?: CoreJwtClaims | null,
): Promise<SessionUser | null> {
  const user = await db.user.findUnique({ where: { id: clerkId } });
  if (!user || user.status === 'banned') return null;
  return sessionUserFor(user, coreClaims);
}
