import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { recordStatusReview, setLastEditor } from '@/lib/article-audit';
import { logger } from '@/lib/logger';
import { withRequestLogging } from '@/lib/logging/request-logger';

const POST = withRequestLogging(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { note } = body;

  const article = await db.article.findUnique({ where: { id } });
  if (!article) return apiError('Article not found' , { status: 404 });

  const previousStatus = article.status;

  await db.article.update({ where: { id }, data: { status: 'REJECTED' } });

  await recordStatusReview({
    articleId: id,
    reviewerId: admin.id,
    previousStatus,
    newStatus: 'REJECTED',
    note: note?.trim() || 'Ditolak',
  });
  await setLastEditor(id, admin.id);

  logger.info('article.status_changed', {
    articleId: id,
    slug: article.slug,
    title: article.title?.substring(0, 100),
    previousStatus,
    newStatus: 'REJECTED',
    reviewerId: admin.id,
    action: 'reject',
    note: note?.trim(),
  });

  return apiSuccess({ message: 'Article rejected' });
});

export { POST };
