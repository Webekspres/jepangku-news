import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { recordStatusReview, setLastEditor } from '@/lib/article-audit';
import { executeArticlePublish } from '@/lib/articles/publish-executor';
import {
  assignArticleSchedule,
  parseScheduledPublishAt,
} from '@/lib/articles/schedule';
import { getArticleScheduleErrorResponse } from '@/lib/articles/schedule-errors';
import { logger } from '@/lib/logger';
import { withRequestLogging } from '@/lib/logging/request-logger';

const log = logger.child({ module: 'article.approve' });

const POST = withRequestLogging(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required', { status: 403 });

  const { id } = await params;

  const article = await db.article.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
      qstashMessageId: true,
    },
  });
  if (!article) return apiError('Article not found', { status: 404 });

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const mode = body.mode === 'schedule' ? 'schedule' : 'immediate';
  const previousStatus = article.status;

  if (mode === 'schedule') {
    const parsed = parseScheduledPublishAt(body.scheduledPublishAt);
    if (!parsed.ok) {
      return apiError(parsed.error, { status: 400 });
    }

    await db.article.update({
      where: { id },
      data: {
        status: 'SCHEDULED',
        publishedAt: null,
      },
    });

    try {
      await assignArticleSchedule({
        articleId: id,
        scheduledAt: parsed.date,
        previousMessageId: article.qstashMessageId,
      });
    } catch (error) {
      await db.article.update({
        where: { id },
        data: { status: previousStatus },
      });
      const { message, status } = getArticleScheduleErrorResponse(error);
      return apiError(message, { status });
    }

    await recordStatusReview({
      articleId: id,
      reviewerId: admin.id,
      previousStatus,
      newStatus: 'SCHEDULED',
      note:
        typeof body.note === 'string' && body.note.trim()
          ? body.note.trim()
          : 'Disetujui — dijadwalkan tayang',
    });
    await setLastEditor(id, admin.id);

    log.info('article.approve.scheduled', {
      articleId: id,
      slug: article.slug,
      title: article.title?.substring(0, 100),
      previousStatus,
      scheduledPublishAt: parsed.date.toISOString(),
      reviewerId: admin.id,
    });

    return apiSuccess({
      message: 'Article approved and scheduled',
      scheduledPublishAt: parsed.date.toISOString(),
    });
  }

  const result = await executeArticlePublish({
    articleId: id,
    reviewerId: admin.id,
    note: 'Disetujui dan dipublikasikan',
    source: 'admin_approve',
  });

  if (!result.ok) {
    if (result.reason === 'not_found') {
      return apiError('Article not found', { status: 404 });
    }
    return apiError('Gagal mempublikasikan artikel', { status: 400 });
  }

  log.info('article.approve.published', {
    articleId: id,
    slug: article.slug,
    title: article.title?.substring(0, 100),
    previousStatus,
    reviewerId: admin.id,
    alreadyPublished: result.alreadyPublished ?? false,
  });

  return apiSuccess({ message: 'Article approved and published' });
});

export { POST };
