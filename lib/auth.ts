import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-response';
import { auth, clerkClient, currentUser, getAuth } from '@clerk/nextjs/server';
import type { User } from '@clerk/backend';
import type { ServerGetToken } from '@clerk/shared/types';
import { ensureLocalUserFromClerk } from '@/lib/auth/clerk-user';
import { resolveClerkSessionToken } from '@/lib/auth/clerk-token';
import { applyCoreGamification } from '@/lib/auth/session';
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

type ClerkAuthState = {
  isAuthenticated: boolean;
  userId: string | null;
  getToken: ServerGetToken;
};

function isSessionAuthState(
  authState: unknown,
): authState is ClerkAuthState & { userId: string } {
  return (
    !!authState &&
    typeof authState === 'object' &&
    'userId' in authState &&
    typeof (authState as ClerkAuthState).userId === 'string' &&
    (authState as ClerkAuthState).userId!.length > 0 &&
    'getToken' in authState &&
    typeof (authState as ClerkAuthState).getToken === 'function'
  );
}

async function syncSessionUser(
  authState: ClerkAuthState & { userId: string },
  clerkUser: User,
  request?: NextRequest,
): Promise<SessionUser | null> {
  try {
    let coreClaims = await getCoreJwtClaims();
    const clerkToken = await resolveClerkSessionToken(authState, request);

    const user = await ensureLocalUserFromClerk(clerkUser, coreClaims);

    // Poin dari Core public API dulu — jangan tunggu exchange JWT (bisa gagal/lambat).
    let sessionUser = await applyCoreGamification(user, coreClaims);

    if (clerkToken && (!coreClaims || coreClaims.sub !== clerkUser.id)) {
      coreClaims =
        (await establishCoreSession(clerkToken, { maxAttempts: 1 })) ?? coreClaims;
      if (coreClaims?.jepangku?.roles?.length) {
        sessionUser = { ...sessionUser, coreRoles: coreClaims.jepangku.roles };
      }
      // Poin tetap dari applyCoreGamification (public API); klaim JWT sering basi.
    }

    return sessionUser;
  } catch (e) {
    console.error('Clerk JIT user sync failed:', e);
    return null;
  }
}

async function authenticateClerkRequest(
  request: NextRequest,
): Promise<{
  user: SessionUser;
  clerkToken: string | null;
} | null> {
  const client = await clerkClient();
  const requestState = await client.authenticateRequest(request, {
    acceptsToken: ['session_token'],
  });
  const authState = requestState.toAuth();
  if (!isSessionAuthState(authState)) return null;

  const clerkUser = await client.users.getUser(authState.userId);
  if (!clerkUser) return null;

  const user = await syncSessionUser(authState, clerkUser as unknown as User, request);
  if (!user) return null;

  const clerkToken = await resolveClerkSessionToken(authState, request);
  return { user, clerkToken };
}

async function resolveClerkAuthState(
  request: NextRequest,
): Promise<(ClerkAuthState & { userId: string }) | null> {
  try {
    const fromRequest = getAuth(request);
    if (isSessionAuthState(fromRequest)) return fromRequest;
  } catch {
    // fall through
  }

  try {
    const fromMiddleware = await auth();
    if (isSessionAuthState(fromMiddleware)) return fromMiddleware;
  } catch {
    // fall through
  }

  const client = await clerkClient();
  let req: NextRequest = request;

  for (let pass = 0; pass < 2; pass += 1) {
    const requestState = await client.authenticateRequest(req, {
      acceptsToken: ['session_token'],
    });
    const authState = requestState.toAuth();
    if (isSessionAuthState(authState)) return authState;

    if (pass === 0 && request.headers.get('authorization')?.startsWith('Bearer ')) {
      const headers = new Headers(request.headers);
      headers.delete('authorization');
      req = new NextRequest(request.url, { method: request.method, headers });
      continue;
    }
    break;
  }

  return null;
}

/** Authenticate from the incoming request (middleware headers, cookies, bearer). */
export async function authenticateRequestUser(request: NextRequest): Promise<{
  user: SessionUser;
  clerkToken: string | null;
} | null> {
  const authState = await resolveClerkAuthState(request);
  if (!authState) {
    return authenticateClerkRequest(request);
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(authState.userId);
  if (!clerkUser) return null;

  const user = await syncSessionUser(authState, clerkUser as unknown as User, request);
  if (!user) return null;

  const clerkToken = await resolveClerkSessionToken(authState, request);
  return { user, clerkToken };
}

async function getCurrentUserFromClerk(): Promise<SessionUser | null> {
  const authState = await auth();
  if (!isSessionAuthState(authState)) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  return syncSessionUser(authState, clerkUser as unknown as User);
}

/** Resolves portal session from Clerk + Core JWT + JIT sync to local profile. */
export async function getCurrentUser(request?: NextRequest): Promise<SessionUser | null> {
  if (request) {
    const result = await authenticateRequestUser(request);
    return result?.user ?? null;
  }
  return getCurrentUserFromClerk();
}

export async function getCurrentAdmin(request?: NextRequest): Promise<SessionUser | null> {
  const user = await getCurrentUser(request);
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

  const claims = await establishCoreSession(clerkSessionToken);
  if (!claims) return response;

  const token = await getCoreSessionToken();
  if (token) {
    const { coreSessionCookieOptions, CORE_SESSION_COOKIE } = await import('@/lib/core/session');
    response.cookies.set(CORE_SESSION_COOKIE, token, coreSessionCookieOptions());
  }

  return response;
}

export function authProviderDisabledResponse(): NextResponse {
  return apiError('Local authentication is disabled. Use Clerk sign-in at /sign-in.', {
    status: 410,
    code: 'LOCAL_AUTH_DISABLED',
  });
}
