import type { Role } from '@prisma/client';

/** Stable session shape for portal features — independent of auth backend. */
export type SessionUser = {
  id: string;
  clerkId: string | null;
  name: string;
  username: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  totalPoints: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};
