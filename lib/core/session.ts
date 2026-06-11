import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import { exchangeClerkToken } from './auth';
import { CoreApiError } from './client';
import { isCoreApiConfigured } from './config';
import { isCoreJwtVerifyConfigured, verifyCoreJwtToken } from './verify-jwt';

export const CORE_SESSION_COOKIE = 'core_session';
const CORE_SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export type CoreJwtClaims = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  exp?: number;
  jepangku?: {
    totalXp: number;
    currentPoints: number;
    level: number;
    roles: string[];
  };
};

function parseVerifiedPayload(payload: unknown): CoreJwtClaims | null {
  if (!payload || typeof payload !== 'object' || !('sub' in payload)) return null;
  const sub = (payload as { sub: unknown }).sub;
  if (typeof sub !== 'string' || !sub) return null;
  return payload as CoreJwtClaims;
}

/** @deprecated Use verified claims via getCoreJwtClaims — decode-only without signature check. */
export function decodeCoreJwtClaims(token: string): CoreJwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json) as CoreJwtClaims;
  } catch {
    return null;
  }
}

async function verifyAndParseClaims(token: string): Promise<CoreJwtClaims | null> {
  if (isCoreJwtVerifyConfigured()) {
    try {
      const payload = await verifyCoreJwtToken(token);
      return parseVerifiedPayload(payload);
    } catch (error) {
      logger.warn('core.session.verify.failed', {
        message: error instanceof Error ? error.message : 'unknown',
      });
      return null;
    }
  }

  const claims = decodeCoreJwtClaims(token);
  if (claims) {
    logger.warn('core.session.verify.skipped', {
      reason: 'CORE_JWT_PUBLIC_KEY not configured — using decode-only',
    });
  }
  return claims;
}

export async function getCoreSessionToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(CORE_SESSION_COOKIE)?.value ?? null;
}

export async function clearCoreSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(CORE_SESSION_COOKIE);
}

export async function getCoreJwtClaims(): Promise<CoreJwtClaims | null> {
  const token = await getCoreSessionToken();
  if (!token) return null;
  return verifyAndParseClaims(token);
}

export function coreSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: CORE_SESSION_MAX_AGE,
    path: '/',
  };
}

/** Exchange Clerk session for Core JWT and persist in httpOnly cookie. */
export async function establishCoreSession(clerkSessionToken: string): Promise<CoreJwtClaims | null> {
  if (!isCoreApiConfigured()) return null;

  try {
    const { token } = await exchangeClerkToken(clerkSessionToken);
    const jar = await cookies();
    jar.set(CORE_SESSION_COOKIE, token, coreSessionCookieOptions());
    return verifyAndParseClaims(token);
  } catch (error) {
    const meta =
      error instanceof CoreApiError
        ? { code: error.code, status: error.status, message: error.message }
        : { message: error instanceof Error ? error.message : 'unknown' };
    logger.warn('core.session.establish.failed', meta);
    return null;
  }
}

/** Refresh Core session after gamification award (claims may be stale). */
export async function refreshCoreSession(clerkSessionToken: string): Promise<void> {
  await establishCoreSession(clerkSessionToken);
}

/** Refresh Core JWT for the current Clerk session (server-only). */
export async function refreshCurrentUserCoreSession(): Promise<void> {
  const { auth } = await import('@clerk/nextjs/server');
  const authState = await auth();
  if (!authState.isAuthenticated) return;
  const clerkToken = await authState.getToken();
  if (clerkToken) {
    await refreshCoreSession(clerkToken);
  }
}
