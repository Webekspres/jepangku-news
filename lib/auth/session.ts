import type { User } from '@prisma/client';
import { isCoreApiConfigured } from '@/lib/core/config';
import { getCoreSessionToken } from '@/lib/core/session';
import type { CoreJwtClaims } from '@/lib/core/session';
import { fetchCoreUserMe, fetchCoreUserProfile } from '@/lib/core/users';
import type { SessionUser } from './types';

function gamificationFromClaims(coreClaims?: CoreJwtClaims | null): Pick<
  SessionUser,
  'totalPoints' | 'totalXp' | 'currentLevel' | 'coreRoles'
> {
  const jepangku = coreClaims?.jepangku;
  return {
    totalPoints: jepangku?.currentPoints ?? 0,
    totalXp: jepangku?.totalXp ?? 0,
    currentLevel: jepangku?.level ?? 1,
    coreRoles: jepangku?.roles ?? [],
  };
}

/** Resolve live gamification stats from Core (leaderboard uses the same source). */
export async function applyCoreGamification(
  user: SessionUser,
  coreClaims?: CoreJwtClaims | null,
): Promise<SessionUser> {
  if (!isCoreApiConfigured()) {
    return { ...user, ...gamificationFromClaims(coreClaims) };
  }

  // Public profile = same data as leaderboard; no Core JWT required.
  const profile = await fetchCoreUserProfile(user.id);
  if (profile) {
    return {
      ...user,
      totalPoints: profile.currentPoints,
      totalXp: profile.totalXp,
      currentLevel: profile.currentLevel,
    };
  }

  const coreJwt = await getCoreSessionToken();
  if (coreJwt) {
    const me = await fetchCoreUserMe(coreJwt);
    if (me) {
      return {
        ...user,
        totalPoints: me.currentPoints,
        totalXp: me.totalXp,
        currentLevel: me.currentLevel,
        coreRoles: me.roles.length > 0 ? me.roles : user.coreRoles,
      };
    }
  }

  return { ...user, ...gamificationFromClaims(coreClaims) };
}

export function toSessionUser(
  user: User,
  options: {
    profileDisplayName?: string | null;
    coreClaims?: CoreJwtClaims | null;
  } = {},
): SessionUser {
  const { profileDisplayName, coreClaims } = options;
  const jepangku = coreClaims?.jepangku;

  return {
    id: user.id,
    name: user.name,
    displayName: profileDisplayName ?? user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    status: user.status,
    totalPoints: jepangku?.currentPoints ?? 0,
    totalXp: jepangku?.totalXp ?? 0,
    currentLevel: jepangku?.level ?? 1,
    coreRoles: jepangku?.roles ?? [],
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}
