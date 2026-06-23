import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { canCreateArticles, CONTRIBUTOR_REQUIRED_ERROR } from '@/lib/contributor';
import { db } from '@/lib/db';
import { auditArticleDelete } from '@/lib/audit-routes';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) return apiError('Not authenticated' , { status: 401 });
  if (!canCreateArticles(user)) {
    return apiSuccess(CONTRIBUTOR_REQUIRED_ERROR, { status: 403 });
  }

  const { slug } = await params;

  const article = await db.article.findFirst({ where: { slug } });
  if (!article) return apiError('Article not found' , { status: 404 });

  if (article.authorId !== user.id && user.role !== 'ADMIN') {
    return apiError('Not authorized' , { status: 403 });
  }

  if (article.status === 'PUBLISHED' && user.role !== 'ADMIN') {
    return apiError('Cannot delete published articles' , { status: 400 });
  }

  await db.article.delete({ where: { id: article.id } });

  auditArticleDelete(
    user,
    { id: article.id, title: article.title },
    user.role === 'ADMIN',
  );

  return apiSuccess({ message: 'Article deleted' });
}
