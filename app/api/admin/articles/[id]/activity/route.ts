import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { reviewListSelect, revisionListSelect } from '@/lib/article-audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;

  const article = await db.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
      lastEditedAt: true,
      lastEditedBy: { select: { id: true, name: true, role: true } },
    },
  });

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  const [reviews, revisions] = await Promise.all([
    db.articleReview.findMany({
      where: { articleId: id },
      orderBy: { reviewedAt: 'desc' },
      select: reviewListSelect,
    }),
    db.articleRevision.findMany({
      where: { articleId: id },
      orderBy: { revisionNumber: 'desc' },
      select: revisionListSelect,
    }),
  ]);

  return NextResponse.json({
    articleTitle: article.title,
    articleStatus: article.status,
    lastEditedAt: article.lastEditedAt,
    lastEditedBy: article.lastEditedBy,
    reviews,
    revisions,
  });
}
