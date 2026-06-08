import type { User } from '@prisma/client';
import type { SessionUser } from './types';

export function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    clerkId: user.clerkId,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    totalPoints: user.totalPoints,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}
