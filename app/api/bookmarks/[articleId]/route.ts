import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { gamificationFieldsFromAward } from '@/lib/gamification-response';
import { awardPoints } from '@/lib/points';
import { enforceRateLimit } from '@/lib/rate-limit';
import { captureException } from '@/lib/monitoring';
import { auditBookmark } from '@/lib/audit-routes';

export async function POST(request: NextRequest, { params }: { params: Promise<{ articleId: string }> }) {
  try {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const blocked = await enforceRateLimit(request, 'bookmark', {
    max: 20,
    windowMs: 60_000,
    identifier: user.id,
    message: 'Terlalu banyak bookmark. Coba lagi sebentar.',
  });
  if (blocked) return blocked;

  const { articleId } = await params;

  const article = await db.article.findUnique({ where: { id: articleId } });
  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

  const existing = await db.bookmark.findFirst({
    where: { userId: user.id, articleId, deletedAt: null },
  });
  if (existing) return NextResponse.json({ message: 'Already bookmarked' });

  const old = await db.bookmark.findFirst({ where: { userId: user.id, articleId } });

  if (old) {
    await db.bookmark.update({ where: { id: old.id }, data: { deletedAt: null } });
  } else {
    await db.bookmark.create({
      data: { userId: user.id, articleId, firstBookmarkedAt: new Date() },
    });
  }

  await db.article.update({ where: { id: articleId }, data: { bookmarkCount: { increment: 1 } } });

  const award = await awardPoints(
    user.id, 'article_bookmarked', 'article', articleId, 1,
    `Bookmarked article: ${article.title}`
  );

  auditBookmark(user, 'create', article);

  return NextResponse.json({
    message: 'Bookmarked',
    pointsAwarded: award.awarded,
    ...gamificationFieldsFromAward(award),
  });
  } catch (e) {
    await captureException(e, { route: 'bookmark-create' });
    return NextResponse.json({ error: 'Failed to bookmark' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ articleId: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { articleId } = await params;

  const bookmark = await db.bookmark.findFirst({
    where: { userId: user.id, articleId, deletedAt: null },
  });
  if (!bookmark) return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });

  await db.bookmark.update({ where: { id: bookmark.id }, data: { deletedAt: new Date() } });
  await db.article.update({ where: { id: articleId }, data: { bookmarkCount: { decrement: 1 } } });

  const article = await db.article.findUnique({
    where: { id: articleId },
    select: { id: true, title: true },
  });
  if (article) auditBookmark(user, 'delete', article);

  return NextResponse.json({ message: 'Bookmark removed' });
}
