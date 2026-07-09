import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { executeArticlePublish } from '@/lib/articles/publish-executor';
import { cancelArticlePublishJob } from '@/lib/articles/schedule';
import { logger } from '@/lib/logger';
import { withRequestLogging } from '@/lib/logging/request-logger';

const log = logger.child({ module: 'article.publish_now' });

const POST = withRequestLogging(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required', { status: 403 });

  const { id } = await params;

  const article = await db.article.findUnique({
    where: { id },
    select: { id: true, status: true, qstashMessageId: true },
  });
  if (!article) return apiError('Article not found', { status: 404 });

  if (article.status !== 'SCHEDULED') {
    return apiError('Hanya artikel terjadwal yang dapat dipublikasikan sekarang', { status: 400 });
  }

  await cancelArticlePublishJob(article.qstashMessageId);

  log.info('article.publish_now.requested', {
    articleId: id,
    adminId: admin.id,
  });

  const result = await executeArticlePublish({
    articleId: id,
    reviewerId: admin.id,
    note: 'Dipublikasikan sekarang oleh admin',
    source: 'admin_publish_now',
  });

  if (!result.ok) {
    return apiError('Gagal mempublikasikan artikel', { status: 500 });
  }

  return apiSuccess({
    message: 'Article published',
    alreadyPublished: result.alreadyPublished ?? false,
  });
});

export { POST };
