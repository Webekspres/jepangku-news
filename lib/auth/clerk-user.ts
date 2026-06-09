import type { User } from '@clerk/backend';
import type { User as DbUser } from '@prisma/client';
import { db } from '@/lib/db';
import type { CoreJwtClaims } from '@/lib/core/session';
import { checkDailyLogin } from '@/lib/points';
import { toSessionUser } from './session';
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

function slugifyUsername(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24);
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
    throw new Error(
      'Email already linked to a different account. Run phase 3 migration or contact support.',
    );
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
