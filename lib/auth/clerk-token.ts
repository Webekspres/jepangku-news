import type { ServerGetToken } from '@clerk/shared/types';
import type { NextRequest } from 'next/server';

type TokenAuthState = {
  getToken: ServerGetToken;
};

/** Resolve a Clerk session JWT for Core token exchange. */
export async function resolveClerkSessionToken(
  authState: TokenAuthState,
  request?: NextRequest,
): Promise<string | null> {
  const token = await authState.getToken();
  if (token) return token;

  const sessionCookie = request?.cookies.get('__session')?.value;
  if (sessionCookie) return sessionCookie;

  return null;
}
