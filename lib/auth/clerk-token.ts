import type { NextRequest } from 'next/server';

type TokenAuthState = {
  getToken: (options?: { skipCache?: boolean }) => Promise<string | null>;
};

/** Resolve a Clerk session JWT for Core token exchange (fresh, not cached). */
export async function resolveClerkSessionToken(
  authState: TokenAuthState,
  request?: NextRequest,
): Promise<string | null> {
  const fresh = await authState.getToken({ skipCache: true });
  if (fresh) return fresh;

  const cached = await authState.getToken();
  if (cached) return cached;

  const sessionCookie = request?.cookies.get('__session')?.value;
  if (sessionCookie) return sessionCookie;

  return null;
}
