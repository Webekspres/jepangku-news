import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { gamificationFieldsFromAward } from '@/lib/gamification-response';
import { awardPoints } from '@/lib/points';
import { enforceRateLimit } from '@/lib/rate-limit';
import { captureException } from '@/lib/monitoring';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const blocked = await enforceRateLimit(request, 'article-share', {
    max: 10,
    windowMs: 60 * 60 * 1000,
    identifier: user.id,
    message: 'Terlalu banyak berbagi artikel. Coba lagi nanti.',
  });
  if (blocked) return blocked;

  const { slug } = await params;
  const { shareMethod = 'copy-link' } = await request.json().catch(() => ({}));

  // Find article by slug
  const article = await db.article.findUnique({ where: { slug } });
  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  // Check if user already shared this article
  const existing = await db.articleShare.findFirst({
    where: { userId: user.id, articleId: article.id },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Already shared this article', pointsAwarded: false },
      { status: 400 }
    );
  }

  // Create share record
  const share = await db.articleShare.create({
    data: {
      userId: user.id,
      articleId: article.id,
      shareMethod,
      pointsAwarded: 5,
      isPointAwarded: false, // Will be set to true after points are awarded
    },
  });

  // Award points - use 5 points for article share
  const award = await awardPoints(
    user.id,
    'article_shared',
    'article',
    article.id,
    5,
    `Shared article: ${article.title}`
  );

  if (award.awarded) {
    await db.articleShare.update({
      where: { id: share.id },
      data: { isPointAwarded: true },
    });
  }

  // Increment share count
  await db.article.update({
    where: { id: article.id },
    data: { shareCount: { increment: 1 } },
  });

  return NextResponse.json({
    message: 'Share tracked successfully',
    pointsAwarded: award.awarded,
    points: award.awarded ? 5 : 0,
    ...gamificationFieldsFromAward(award),
  });
  } catch (e) {
    await captureException(e, { route: 'article-share' });
    return NextResponse.json({ error: 'Failed to track share' }, { status: 500 });
  }
}

// GET endpoint to check if user already shared this article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ hasShared: false });
  }

  const { slug } = await params;

  const article = await db.article.findUnique({ where: { slug } });
  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  const share = await db.articleShare.findFirst({
    where: { userId: user.id, articleId: article.id },
  });

  return NextResponse.json({
    hasShared: !!share,
    shareData: share || null,
  });
}
