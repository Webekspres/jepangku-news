import type { Role, ContributorApplicationStatus } from '@prisma/client';

/** Stable session shape for portal features — independent of auth backend. */
export type GamificationPatch = {
  totalPoints?: number;
  totalXp?: number;
  currentLevel?: number;
};

export type SessionUser = {
  /** Clerk User ID (= jepangku-core users.id) */
  id: string;
  name: string;
  /** Public display label — prefers profile.displayName over user.name. */
  displayName: string;
  username: string;
  email: string;
  /** Portal-local role (legacy UI); admin gate uses coreRoles. */
  role: Role;
  avatarUrl: string | null;
  status: string;
  /** Latest contributor application status for non-contributors. */
  contributorApplicationStatus?: ContributorApplicationStatus | null;
  /** Global points from Core (`currentPoints` — live API, fallback JWT). */
  totalPoints: number;
  totalXp: number;
  currentLevel: number;
  /** Global roles from Core JWT (NEWS_EDITOR, CORE_ADMIN, …). */
  coreRoles: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export const CORE_ADMIN_ROLES = [
  'PORTAL_ADMIN',
  'CORE_ADMIN',
  'NEWS_EDITOR', // legacy Core seed alias
] as const;

export function hasNewsAdminAccess(user: SessionUser): boolean {
  if (user.role === 'ADMIN') return true;
  return user.coreRoles.some((r) =>
    (CORE_ADMIN_ROLES as readonly string[]).includes(r),
  );
}
