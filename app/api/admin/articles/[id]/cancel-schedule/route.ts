import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { recordStatusReview, setLastEditor } from '@/lib/article-audit';
import { clearArticleSchedule } from '@/lib/articles/schedule';
import { logger } from '@/lib/logger';
import { withRequestLogging } from '@/lib/logging/request-logger';

const log = logger.child({ module: 'article.cancel_schedule' });

const POST = withRequestLogging(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required', { status: 403 });

  const { id } = await params;

  const article = await db.article.findUnique({
    where: { id },
    select: { id: true, status: true, title: true },
  });
  if (!article) return apiError('Article not found', { status: 404 });

  if (article.status !== 'SCHEDULED') {
    return apiError('Artikel tidak dalam status terjadwal', { status: 400 });
  }

  const previousStatus = article.status;

  await clearArticleSchedule(id);

  await db.article.update({
    where: { id },
    data: { status: 'DRAFT' },
  });

  await recordStatusReview({
    articleId: id,
    reviewerId: admin.id,
    previousStatus,
    newStatus: 'DRAFT',
    note: 'Jadwal tayang dibatalkan',
  });
  await setLastEditor(id, admin.id);

  log.info('article.cancel_schedule.completed', {
    articleId: id,
    adminId: admin.id,
    title: article.title?.substring(0, 100),
  });

  return apiSuccess({ message: 'Schedule cancelled' });
});

export { POST };
