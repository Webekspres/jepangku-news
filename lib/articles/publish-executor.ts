import type { ArticleStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { recordStatusReview, setLastEditor } from '@/lib/article-audit';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'article.publish' });

export type ArticlePublishSource =
  | 'qstash'
  | 'admin_approve'
  | 'admin_publish_now'
  | 'admin_immediate'
  | 'fallback_immediate';

export type ExecuteArticlePublishParams = {
  articleId: string;
  reviewerId: string;
  note?: string | null;
  source: ArticlePublishSource;
};

export type ExecuteArticlePublishResult = {
  ok: boolean;
  alreadyPublished?: boolean;
  reason?: 'not_found' | 'invalid_status';
  articleId?: string;
  previousStatus?: ArticleStatus;
};

export async function executeArticlePublish(
  params: ExecuteArticlePublishParams,
): Promise<ExecuteArticlePublishResult> {
  const article = await db.article.findUnique({
    where: { id: params.articleId },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
      scheduledPublishAt: true,
      qstashMessageId: true,
    },
  });

  if (!article) {
    log.warn('article.publish.not_found', {
      articleId: params.articleId,
      source: params.source,
    });
    return { ok: false, reason: 'not_found' };
  }

  if (article.status === 'PUBLISHED') {
    log.info('article.publish.skipped_already_published', {
      articleId: article.id,
      source: params.source,
    });
    return { ok: true, alreadyPublished: true, articleId: article.id };
  }

  const allowedStatuses: ArticleStatus[] = ['SCHEDULED', 'PENDING_REVIEW'];
  if (!allowedStatuses.includes(article.status)) {
    log.warn('article.publish.invalid_status', {
      articleId: article.id,
      status: article.status,
      source: params.source,
    });
    return { ok: false, reason: 'invalid_status', articleId: article.id };
  }

  const previousStatus = article.status;
  const now = new Date();
  const publishedAt =
    previousStatus === 'SCHEDULED' &&
    article.scheduledPublishAt &&
    article.scheduledPublishAt.getTime() <= now.getTime()
      ? article.scheduledPublishAt
      : now;

  await db.article.update({
    where: { id: article.id },
    data: {
      status: 'PUBLISHED',
      publishedAt: article.publishedAt ?? publishedAt,
      scheduledPublishAt: null,
      qstashMessageId: null,
    },
  });

  const reviewNote =
    params.note?.trim() ||
    (previousStatus === 'SCHEDULED'
      ? 'Artikel tayang sesuai jadwal'
      : 'Dipublikasikan oleh admin');

  await recordStatusReview({
    articleId: article.id,
    reviewerId: params.reviewerId,
    previousStatus,
    newStatus: 'PUBLISHED',
    note: reviewNote,
  });
  await setLastEditor(article.id, params.reviewerId);

  log.info('article.publish.completed', {
    articleId: article.id,
    slug: article.slug,
    title: article.title?.substring(0, 100),
    previousStatus,
    publishedAt: publishedAt.toISOString(),
    source: params.source,
    reviewerId: params.reviewerId,
  });

  return {
    ok: true,
    articleId: article.id,
    previousStatus,
  };
}
