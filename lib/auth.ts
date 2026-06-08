import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ensureLocalUserFromClerk } from '@/lib/auth/clerk-user';
import type { SessionUser } from '@/lib/auth/types';

export type { SessionUser } from '@/lib/auth/types';
export {
  getAuthProvider,
  getSignInPath,
  getSignUpPath,
  isClerkAuthEnabled,
  isClerkAuthEnabledClient,
} from '@/lib/auth/config';

async function getCurrentUserFromClerk(): Promise<SessionUser | null> {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  try {
    return await ensureLocalUserFromClerk(clerkUser);
  } catch (e) {
    console.error('Clerk JIT user sync failed:', e);
    return null;
  }
}

/** Resolves portal session from Clerk + JIT sync to local `users` table. */
export async function getCurrentUser(_request?: NextRequest): Promise<SessionUser | null> {
  return getCurrentUserFromClerk();
}

export async function getCurrentAdmin(_request?: NextRequest): Promise<SessionUser | null> {
  const user = await getCurrentUserFromClerk();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export function authProviderDisabledResponse(): NextResponse {
  return NextResponse.json(
    {
      error: 'Local authentication is disabled. Use Clerk sign-in at /sign-in.',
      code: 'LOCAL_AUTH_DISABLED',
    },
    { status: 410 },
  );
}
