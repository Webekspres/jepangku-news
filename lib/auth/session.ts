import type { User } from '@prisma/client';
import type { CoreJwtClaims } from '@/lib/core/session';
import type { SessionUser } from './types';

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
