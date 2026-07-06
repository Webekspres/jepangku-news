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
        errorMessage: error instanceof Error ? error.message : 'unknown',
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

const CORE_SESSION_RETRY_ATTEMPTS = 3;
const CORE_SESSION_RETRY_BASE_MS = 350;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type EstablishCoreSessionOptions = {
  maxAttempts?: number;
};

/** Exchange Clerk session for Core JWT and persist in httpOnly cookie. */
export async function establishCoreSession(
  clerkSessionToken: string,
  options: EstablishCoreSessionOptions = {},
): Promise<CoreJwtClaims | null> {
  if (!isCoreApiConfigured()) {
    logger.warn('core.session.establish.skipped', {
      reason: 'CORE_API_URL not configured',
    });
    return null;
  }
  if (!clerkSessionToken?.trim()) {
    logger.warn('core.session.establish.skipped', {
      reason: 'No Clerk session token provided',
    });
    return null;
  }

  const maxAttempts = Math.max(1, options.maxAttempts ?? CORE_SESSION_RETRY_ATTEMPTS);
  let lastError: unknown = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0) {
      await sleep(CORE_SESSION_RETRY_BASE_MS * attempt);
    }

    try {
      const { token } = await exchangeClerkToken(clerkSessionToken);
      const jar = await cookies();
      jar.set(CORE_SESSION_COOKIE, token, coreSessionCookieOptions());

      const claims = await verifyAndParseClaims(token);
      if (claims) {
        logger.info('core.session.establish.success', {
          userId: claims.sub,
          attempt: attempt + 1,
          roles: claims.jepangku?.roles,
        });
      }
      return claims;
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof CoreApiError &&
        (error.code === 'INVALID_SESSION' || error.code === 'USER_NOT_FOUND') &&
        attempt < maxAttempts - 1;

      if (attempt > 0 || retryable) {
        logger.warn('core.session.establish.retry', {
          attempt: attempt + 1,
          maxAttempts,
          error: error instanceof CoreApiError
            ? { code: error.code, status: error.status }
            : { message: error instanceof Error ? error.message : 'unknown' },
        });
      }

      if (retryable) continue;
      break;
    }
  }

  const meta =
    lastError instanceof CoreApiError
      ? {
          code: lastError.code,
          status: lastError.status,
          errorMessage: lastError.message,
        }
      : {
          errorMessage: lastError instanceof Error ? lastError.message : 'unknown',
        };
  logger.warn('core.session.establish.failed', meta);
  return null;
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
  const { resolveClerkSessionToken } = await import('@/lib/auth/clerk-token');
  const clerkToken = await resolveClerkSessionToken(authState);
  if (clerkToken) {
    await refreshCoreSession(clerkToken);
  }
}
