import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { awardPoints } from '@/lib/points';

const READ_POINTS = 2;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) {
    // Guest — acknowledge silently, no points
    return NextResponse.json({ awarded: false, points: 0, reason: 'not_authenticated' });
  }

  const { slug } = await params;

  const article = await db.article.findFirst({
    where: { slug, status: 'PUBLISHED' },
    select: { id: true, title: true },
  });

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  // Award points — awardPoints handles anti-duplicate internally
  const awarded = await awardPoints(
    user.id,
    'article_read',
    'article',
    article.id,
    READ_POINTS,
    `Read article: ${article.title}`,
  );

  return NextResponse.json({
    awarded,
    points: awarded ? READ_POINTS : 0,
    reason: awarded ? 'points_awarded' : 'already_awarded',
  });
}
