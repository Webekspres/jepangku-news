import { db } from '@/lib/db';
import { shouldPublishEmailViaQstash } from '@/lib/email/config';
import { getQstashClient } from '@/lib/email/qstash';
import { logger } from '@/lib/logger';
import { getSiteUrl } from '@/lib/site-url';
import { getArticleScheduleHeaders } from '@/lib/articles/schedule-config';
import { executeArticlePublish } from '@/lib/articles/publish-executor';

export {
  MIN_SCHEDULE_LEAD_MS,
  parseScheduledPublishAt,
  type ScheduleParseResult,
} from '@/lib/articles/schedule-validation';

const log = logger.child({ module: 'article.schedule' });

function getPublishProcessUrl(): string {
  return `${getSiteUrl()}/api/internal/articles/publish`;
}

export async function cancelArticlePublishJob(
  messageId: string | null | undefined,
): Promise<void> {
  if (!messageId) return;

  const client = getQstashClient();
  if (!client) {
    log.warn('article.schedule.cancel_skipped', {
      messageId,
      reason: 'QSTASH_NOT_CONFIGURED',
    });
    return;
  }

  try {
    await client.messages.delete(messageId);
    log.info('article.schedule.cancelled', { messageId });
  } catch (error) {
    log.warn('article.schedule.cancel_failed', {
      messageId,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
  }
}

export async function scheduleArticlePublishJob(params: {
  articleId: string;
  scheduledAt: Date;
}): Promise<string | null> {
  const processUrl = getPublishProcessUrl();
  const client = getQstashClient();
  const notBefore = Math.floor(params.scheduledAt.getTime() / 1000);

  if (client && shouldPublishEmailViaQstash()) {
    try {
      const headers = getArticleScheduleHeaders();
      const result = await client.publishJSON({
        url: processUrl,
        body: { articleId: params.articleId },
        notBefore,
        deduplicationId: `article-scheduled-publish:${params.articleId}`,
        ...(headers ? { headers } : {}),
      });

      log.info('article.schedule.qstash_enqueued', {
        articleId: params.articleId,
        messageId: result.messageId,
        notBefore,
        processUrl,
      });

      return result.messageId;
    } catch (error) {
      log.warn('article.schedule.qstash_failed', {
        articleId: params.articleId,
        errorMessage: error instanceof Error ? error.message : 'unknown',
      });
    }
  }

  log.warn('article.schedule.fallback_immediate', {
    articleId: params.articleId,
    reason: 'QSTASH_UNAVAILABLE',
  });

  // Dev / test fallback: process immediately when QStash is unavailable.
  void executeArticlePublish({
    articleId: params.articleId,
    reviewerId: 'system',
    note: 'Dipublikasikan otomatis (fallback tanpa QStash)',
    source: 'fallback_immediate',
  }).catch((error) => {
    log.warn('article.schedule.fallback_failed', {
      articleId: params.articleId,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
  });

  return null;
}

export async function assignArticleSchedule(params: {
  articleId: string;
  scheduledAt: Date;
  previousMessageId?: string | null;
}): Promise<string | null> {
  await cancelArticlePublishJob(params.previousMessageId);

  const messageId = await scheduleArticlePublishJob({
    articleId: params.articleId,
    scheduledAt: params.scheduledAt,
  });

  await db.article.update({
    where: { id: params.articleId },
    data: {
      scheduledPublishAt: params.scheduledAt,
      qstashMessageId: messageId,
    },
  });

  log.info('article.schedule.assigned', {
    articleId: params.articleId,
    scheduledPublishAt: params.scheduledAt.toISOString(),
    messageId,
  });

  return messageId;
}

export async function clearArticleSchedule(articleId: string): Promise<void> {
  const article = await db.article.findUnique({
    where: { id: articleId },
    select: { qstashMessageId: true },
  });

  await cancelArticlePublishJob(article?.qstashMessageId);

  await db.article.update({
    where: { id: articleId },
    data: {
      scheduledPublishAt: null,
      qstashMessageId: null,
    },
  });

  log.info('article.schedule.cleared', { articleId });
}
