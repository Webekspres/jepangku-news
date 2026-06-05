import { NextRequest, NextResponse } from 'next/server';

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

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

export function enforceRateLimit(
  request: NextRequest,
  keyPrefix: string,
  options: { max: number; windowMs: number; message?: string; identifier?: string }
): NextResponse | null {
  const identifier = options.identifier || getIpAddress(request);
  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  const nextCount = existing.count + 1;
  if (nextCount > options.max) {
    const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
    return NextResponse.json(
      {
        error: options.message || 'Rate limit exceeded. Try again later.',
        retryAfter: retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      },
    );
  }

  rateLimitStore.set(key, { count: nextCount, resetAt: existing.resetAt });
  return null;
}
