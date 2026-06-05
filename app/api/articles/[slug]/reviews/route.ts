import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { reviewListSelect } from '@/lib/article-audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { slug } = await params;

  const article = await db.article.findUnique({
    where: { slug },
    select: {
      id: true,
      authorId: true,
      title: true,
      status: true,
      lastEditedAt: true,
      lastEditedBy: { select: { id: true, name: true, role: true } },
    },
  });

  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  if (article.authorId !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const reviews = await db.articleReview.findMany({
    where: { articleId: article.id },
    orderBy: { reviewedAt: 'desc' },
    select: reviewListSelect,
  });

  return NextResponse.json({
    articleTitle: article.title,
    articleStatus: article.status,
    lastEditedAt: article.lastEditedAt,
    lastEditedBy: article.lastEditedBy,
    reviews,
  });
}
