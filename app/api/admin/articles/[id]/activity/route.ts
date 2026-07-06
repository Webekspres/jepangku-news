import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { reviewListSelect, revisionListSelect } from '@/lib/article-audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return apiError('Admin access required' , { status: 403 });
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
    return apiError('Article not found' , { status: 404 });
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

  return apiSuccess({
    articleTitle: article.title,
    articleStatus: article.status,
    lastEditedAt: article.lastEditedAt,
    lastEditedBy: article.lastEditedBy,
    reviews,
    revisions,
  });
}
