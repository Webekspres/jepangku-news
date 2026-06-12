import type { User } from '@prisma/client';
import { getCoreSessionToken } from '@/lib/core/session';
import type { CoreJwtClaims } from '@/lib/core/session';
import { fetchCoreUserMe } from '@/lib/core/users';
import { getUserPointBalance } from '@/lib/points';
import type { SessionUser } from './types';

function rolesFromClaims(coreClaims?: CoreJwtClaims | null): string[] {
  return coreClaims?.jepangku?.roles ?? [];
}

function flattenCoreRoles(
  roles: string[] | { global?: string[]; byApplication?: Record<string, string[]> },
): string[] {
  if (Array.isArray(roles)) return roles;
  return [
    ...(roles.global ?? []),
    ...Object.values(roles.byApplication ?? {}).flat(),
  ];
}

/** Attach portal point balance (News DB) and Core roles from JWT/API. */
export async function applyCoreGamification(
  user: SessionUser,
  coreClaims?: CoreJwtClaims | null,
): Promise<SessionUser> {
  const [totalPoints, coreJwt] = await Promise.all([
    getUserPointBalance(user.id),
    getCoreSessionToken(),
  ]);

  let coreRoles = rolesFromClaims(coreClaims);
  if (coreJwt) {
    const me = await fetchCoreUserMe(coreJwt);
    if (me?.roles) {
      coreRoles = flattenCoreRoles(
        me.roles as string[] | { global?: string[]; byApplication?: Record<string, string[]> },
      );
    }
  }

  return {
    ...user,
    totalPoints,
    totalXp: coreClaims?.jepangku?.totalXp ?? user.totalXp ?? 0,
    currentLevel: coreClaims?.jepangku?.level ?? user.currentLevel ?? 1,
    coreRoles: coreRoles.length > 0 ? coreRoles : user.coreRoles,
  };
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
    totalPoints: 0,
    totalXp: jepangku?.totalXp ?? 0,
    currentLevel: jepangku?.level ?? 1,
    coreRoles: rolesFromClaims(coreClaims),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}
