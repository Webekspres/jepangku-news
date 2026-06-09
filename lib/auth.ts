import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ensureLocalUserFromClerk } from '@/lib/auth/clerk-user';
import { hasNewsAdminAccess } from '@/lib/auth/types';
import {
  establishCoreSession,
  getCoreJwtClaims,
  getCoreSessionToken,
} from '@/lib/core/session';
import type { SessionUser } from '@/lib/auth/types';

export type { SessionUser } from '@/lib/auth/types';
export { hasNewsAdminAccess, CORE_ADMIN_ROLES } from '@/lib/auth/types';
export {
  getAuthProvider,
  getSignInPath,
  getSignUpPath,
  isClerkAuthEnabled,
  isClerkAuthEnabledClient,
} from '@/lib/auth/config';

async function getCurrentUserFromClerk(): Promise<SessionUser | null> {
  const authState = await auth();
  if (!authState.isAuthenticated) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  try {
    let coreClaims = await getCoreJwtClaims();
    const clerkToken = await authState.getToken();

    if (!coreClaims && clerkToken) {
      coreClaims = await establishCoreSession(clerkToken);
    }

    return await ensureLocalUserFromClerk(clerkUser, coreClaims);
  } catch (e) {
    console.error('Clerk JIT user sync failed:', e);
    return null;
  }
}

/** Resolves portal session from Clerk + Core JWT + JIT sync to local profile. */
export async function getCurrentUser(_request?: NextRequest): Promise<SessionUser | null> {
  return getCurrentUserFromClerk();
}

export async function getCurrentAdmin(_request?: NextRequest): Promise<SessionUser | null> {
  const user = await getCurrentUserFromClerk();
  if (!user || !hasNewsAdminAccess(user)) return null;
  return user;
}

/** Attach Core session cookie to API response when establishing session. */
export async function withCoreSessionCookie(
  response: NextResponse,
  clerkSessionToken: string,
): Promise<NextResponse> {
  const existing = await getCoreSessionToken();
  if (existing) return response;

  const { exchangeClerkToken } = await import('@/lib/core/auth');
  const { coreSessionCookieOptions, CORE_SESSION_COOKIE } = await import('@/lib/core/session');

  try {
    const jar = await import('next/headers').then((m) => m.cookies());
    if (jar.get(CORE_SESSION_COOKIE)?.value) return response;

    const { token } = await exchangeClerkToken(clerkSessionToken);
    response.cookies.set(CORE_SESSION_COOKIE, token, coreSessionCookieOptions());
  } catch {
    // Non-fatal — portal session still valid via Clerk
  }

  return response;
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
