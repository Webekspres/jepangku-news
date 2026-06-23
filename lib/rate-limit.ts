import { NextRequest, NextResponse } from 'next/server';
import { apiError } from './api-response';
import { logger } from './logger';
import { consumeRateLimit } from './rate-limit-store';

function getIpAddress(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

export async function enforceRateLimit(
  request: NextRequest,
  keyPrefix: string,
  options: { max: number; windowMs: number; message?: string; identifier?: string },
): Promise<NextResponse | null> {
  const databaseUrl = process.env.DATABASE_URL ?? '';
  if (
    databaseUrl.includes('_test') ||
    process.env.DISABLE_RATE_LIMIT === '1' ||
    process.env.NODE_ENV === 'test'
  ) {
    return null;
  }

  const identifier = options.identifier || getIpAddress(request);
  const key = `${keyPrefix}:${identifier}`;

  const result = await consumeRateLimit(key, {
    max: options.max,
    windowMs: options.windowMs,
  });

  if (!result.allowed) {
    const retryAfterSeconds = result.retryAfterSeconds ?? 60;
    logger.warn('rate_limit.exceeded', {
      keyPrefix,
      identifier,
      retryAfterSeconds,
    });
    return apiError(options.message || 'Rate limit exceeded. Try again later.', {
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      meta: { retryAfter: retryAfterSeconds },
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    });
  }

  return null;
}
