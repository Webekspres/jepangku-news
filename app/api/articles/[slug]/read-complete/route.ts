import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { awardPoints } from '@/lib/points';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { slug } = await params;

  const article = await db.article.findFirst({ where: { slug, status: 'PUBLISHED' } });
  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

  const awarded = await awardPoints(
    user.id,
    'article_read',
    'article',
    article.id,
    2,
    `Read article: ${article.title}`
  );

  return NextResponse.json({ awarded, points: awarded ? 2 : 0 });
}
