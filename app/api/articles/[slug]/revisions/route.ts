import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { revisionListSelect } from '@/lib/article-audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) return apiError('Not authenticated' , { status: 401 });

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

  if (!article) return apiError('Article not found' , { status: 404 });
  if (article.authorId !== user.id) {
    return apiError('Forbidden' , { status: 403 });
  }

  const revisions = await db.articleRevision.findMany({
    where: { articleId: article.id },
    orderBy: { revisionNumber: 'desc' },
    select: revisionListSelect,
  });

  return apiSuccess({
    articleTitle: article.title,
    articleStatus: article.status,
    lastEditedAt: article.lastEditedAt,
    lastEditedBy: article.lastEditedBy,
    revisions,
  });
}
