import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { gamificationFieldsFromAward } from '@/lib/gamification-response';
import { awardPoints } from '@/lib/points';
import { enforceRateLimit } from '@/lib/rate-limit';
import { captureException } from '@/lib/monitoring';
import { auditBookmark } from '@/lib/audit-routes';
import { withRequestLogging } from '@/lib/logging/request-logger';

const POST = withRequestLogging(async (request: NextRequest, { params }: { params: Promise<{ articleId: string }> }) => {
  try {
  const user = await getCurrentUser(request);
  if (!user) return apiError('Not authenticated' , { status: 401 });

  const blocked = await enforceRateLimit(request, 'bookmark', {
    max: 20,
    windowMs: 60_000,
    identifier: user.id,
    message: 'Terlalu banyak bookmark. Coba lagi sebentar.',
  });
  if (blocked) {
    logger.warn('bookmark.rate_limited', { userId: user.id, articleId: (await params).articleId });
    return blocked;
  }

  const { articleId } = await params;

  const article = await db.article.findUnique({ where: { id: articleId } });
  if (!article) return apiError('Article not found' , { status: 404 });

  const existing = await db.bookmark.findFirst({
    where: { userId: user.id, articleId, deletedAt: null },
  });
  if (existing) {
    logger.info('bookmark.already_exists', { userId: user.id, articleId });
    return apiSuccess({ message: 'Already bookmarked' });
  }

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

  logger.info('bookmark.created', {
    userId: user.id,
    articleId,
    articleTitle: article.title,
    pointsAwarded: award.awarded,
    isRestore: Boolean(old),
  });

  return apiSuccess({
    message: 'Bookmarked',
    pointsAwarded: award.awarded,
    ...gamificationFieldsFromAward(award),
  });
  } catch (e) {
    await captureException(e, { route: 'bookmark-create' });
    return apiError('Failed to bookmark' , { status: 500 });
  }
});

const DELETE = withRequestLogging(async (request: NextRequest, { params }: { params: Promise<{ articleId: string }> }) => {
  const user = await getCurrentUser(request);
  if (!user) return apiError('Not authenticated' , { status: 401 });

  const { articleId } = await params;

  const bookmark = await db.bookmark.findFirst({
    where: { userId: user.id, articleId, deletedAt: null },
  });
  if (!bookmark) return apiError('Bookmark not found' , { status: 404 });

  await db.bookmark.update({ where: { id: bookmark.id }, data: { deletedAt: new Date() } });
  await db.article.update({ where: { id: articleId }, data: { bookmarkCount: { decrement: 1 } } });

  const article = await db.article.findUnique({
    where: { id: articleId },
    select: { id: true, title: true },
  });
  if (article) {
    auditBookmark(user, 'delete', article);
    logger.info('bookmark.removed', { userId: user.id, articleId, articleTitle: article.title });
  }

  return apiSuccess({ message: 'Bookmark removed' });
});

export { POST, DELETE };
