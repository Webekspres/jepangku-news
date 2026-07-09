import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { captureException } from '@/lib/monitoring';
import { executeArticlePublish } from '@/lib/articles/publish-executor';
import { getArticleScheduleSecret } from '@/lib/articles/schedule-config';
import { isInternalQueueRequestAuthorized } from '@/lib/internal-queue-auth';
import { logger } from '@/lib/logger';
import { withRequestLogging } from '@/lib/logging/request-logger';

const log = logger.child({ module: 'article.publish.internal' });

const POST = withRequestLogging(async (request: NextRequest) => {
  const rawBody = await request.text();

  const authorized = await isInternalQueueRequestAuthorized(
    request,
    rawBody,
    getArticleScheduleSecret(),
  );
  if (!authorized) {
    log.warn('article.publish.internal.unauthorized', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      hasUpstashSignature: !!request.headers.get('upstash-signature'),
      payloadSize: rawBody.length,
    });
    return apiError('Unauthorized', { status: 401 });
  }

  try {
    const body = rawBody ? JSON.parse(rawBody) : {};
    const articleId = typeof body?.articleId === 'string' ? body.articleId.trim() : '';
    if (!articleId) {
      return apiError('articleId required', { status: 400 });
    }

    log.info('article.publish.internal.started', { articleId, payloadSize: rawBody.length });

    const result = await executeArticlePublish({
      articleId,
      reviewerId: 'system',
      note: 'Artikel tayang sesuai jadwal',
      source: 'qstash',
    });

    if (!result.ok && result.reason === 'not_found') {
      return apiError('Article not found', { status: 404 });
    }

    if (!result.ok && result.reason === 'invalid_status') {
      log.warn('article.publish.internal.invalid_status', {
        articleId,
        previousStatus: result.previousStatus,
      });
      return apiSuccess({ ok: false, skipped: true, reason: result.reason });
    }

    log.info('article.publish.internal.completed', {
      articleId,
      alreadyPublished: result.alreadyPublished ?? false,
    });

    return apiSuccess({
      ok: true,
      articleId,
      alreadyPublished: result.alreadyPublished ?? false,
    });
  } catch (e) {
    log.warn('article.publish.internal.failed', {
      errorMessage: e instanceof Error ? e.message : String(e),
    });
    await captureException(e, { route: 'internal-articles-publish' });
    return apiError('Article publish failed', { status: 500 });
  }
});

export { POST };
