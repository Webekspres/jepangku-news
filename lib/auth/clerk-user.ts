import type { User } from '@clerk/backend';
import { db } from '@/lib/db';
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

async function linkOrCreateLocalUser(clerkUser: User): Promise<SessionUser> {
  const clerkId = clerkUser.id;
  const email = primaryEmail(clerkUser);

  if (!email) {
    throw new Error('Clerk user has no email address');
  }

  const byClerkId = await db.user.findUnique({ where: { clerkId } });
  if (byClerkId) {
    if (byClerkId.status === 'banned') {
      throw new Error('Account is banned');
    }
    const updated = await db.user.update({
      where: { id: byClerkId.id },
      data: {
        email,
        name: displayName(clerkUser, email),
        avatarUrl: clerkUser.imageUrl ?? byClerkId.avatarUrl,
        lastLoginAt: new Date(),
      },
    });
    await checkDailyLogin(updated.id);
    const fresh = await db.user.findUnique({ where: { id: updated.id } });
    return toSessionUser(fresh ?? updated);
  }

  const byEmail = await db.user.findUnique({ where: { email } });
  if (byEmail) {
    if (byEmail.status === 'banned') {
      throw new Error('Account is banned');
    }
    const updated = await db.user.update({
      where: { id: byEmail.id },
      data: {
        clerkId,
        name: displayName(clerkUser, email),
        avatarUrl: clerkUser.imageUrl ?? byEmail.avatarUrl,
        lastLoginAt: new Date(),
      },
    });
    await checkDailyLogin(updated.id);
    const fresh = await db.user.findUnique({ where: { id: updated.id } });
    return toSessionUser(fresh ?? updated);
  }

  const username = await generateUniqueUsername(clerkUser, email);
  const name = displayName(clerkUser, email);

  const created = await db.user.create({
    data: {
      clerkId,
      email,
      username,
      name,
      avatarUrl: clerkUser.imageUrl,
      role: 'USER',
      status: 'active',
      totalPoints: 0,
      lastLoginAt: new Date(),
      profile: {
        create: { displayName: name },
      },
    },
  });

  await checkDailyLogin(created.id);
  const fresh = await db.user.findUnique({ where: { id: created.id } });
  return toSessionUser(fresh ?? created);
}

export async function ensureLocalUserFromClerk(clerkUser: User): Promise<SessionUser> {
  return linkOrCreateLocalUser(clerkUser);
}

export async function getSessionUserByClerkId(clerkId: string): Promise<SessionUser | null> {
  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user || user.status === 'banned') return null;
  return toSessionUser(user);
}
