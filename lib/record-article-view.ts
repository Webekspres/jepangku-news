import { NextRequest } from 'next/server';
import { getCurrentUser } from './auth';
import { db } from './db';

function hashVisitorSeed(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

export function resolveVisitorKey(request: NextRequest, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  return `anon:${hashVisitorSeed(ip)}`;
}

/** Catat satu view artikel untuk analytics time-series (non-blocking untuk response). */
export async function recordArticleView(articleId: string, request: NextRequest): Promise<void> {
  try {
    const user = await getCurrentUser(request).catch(() => null);
    const visitorKey = resolveVisitorKey(request, user?.id);

    await db.articleView.create({
      data: {
        articleId,
        userId: user?.id ?? null,
        visitorKey,
      },
    });
  } catch {
    // Analytics tidak boleh mengganggu pembacaan artikel
  }
}
