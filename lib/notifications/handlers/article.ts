import type { ArticleStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { adminArticleHref } from '@/lib/audit-log';
import { getArticleViewHref } from '@/lib/article-view-url';
import { createNotification } from '@/lib/notifications/create';
import { notifyAdminsArticlePendingReview } from '@/lib/notifications/handlers/admin';
import { queueArticleRejectedEmail, queueArticleApprovedEmail } from '@/lib/notifications/email-hooks';
import { notifyCategorySubscribersOfArticle } from '@/lib/category-subscriptions';
import { queueNewsletterNewArticleBroadcastSafe } from '@/lib/newsletter/new-article-broadcast';

export async function handleArticleStatusChanged(params: {
  articleId: string;
  reviewerId: string;
  previousStatus: ArticleStatus;
  newStatus: ArticleStatus;
  note?: string | null;
}): Promise<void> {
  const article = await db.article.findUnique({
    where: { id: params.articleId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      authorId: true,
    },
  });
  if (!article) return;

  if (params.newStatus === 'PENDING_REVIEW') {
    await notifyAdminsArticlePendingReview({
      articleId: article.id,
      title: article.title,
      authorId: article.authorId,
      previousStatus: params.previousStatus,
    });
    return;
  }

  const isFirstPublish =
    params.newStatus === 'PUBLISHED' && params.previousStatus !== 'PUBLISHED';

  if (isFirstPublish) {
    queueNewsletterNewArticleBroadcastSafe(article.id);
    await notifyCategorySubscribersOfArticle(article.id);
  }

  if (params.newStatus !== 'PUBLISHED' && params.newStatus !== 'REJECTED') {
    return;
  }

  if (article.authorId === params.reviewerId) return;

  const link = getArticleViewHref({
    id: article.id,
    slug: article.slug,
    status: params.newStatus,
  });
  const note = params.note?.trim() || null;

  if (params.newStatus === 'PUBLISHED') {
    await createNotification({
      userId: article.authorId,
      type: 'ARTICLE_APPROVED',
      title: 'Artikel Anda disetujui',
      body: `“${article.title}” telah dipublikasikan.`,
      link,
      dedupeKey: `article:${article.id}:published`,
      metadata: {
        articleId: article.id,
        reviewerId: params.reviewerId,
        previousStatus: params.previousStatus,
      },
      priority: 'HIGH',
    });
    await queueArticleApprovedEmail({
      userId: article.authorId,
      articleId: article.id,
      articleTitle: article.title,
      slug: article.slug,
    });
    return;
  }

  await createNotification({
    userId: article.authorId,
    type: 'ARTICLE_REJECTED',
    title: 'Artikel Anda ditolak',
    body: note
      ? `“${article.title}” ditolak. Catatan: ${note}`
      : `“${article.title}” ditolak. Silakan perbaiki dan kirim ulang.`,
    link,
    dedupeKey: `article:${article.id}:rejected`,
    metadata: {
      articleId: article.id,
      reviewerId: params.reviewerId,
      previousStatus: params.previousStatus,
      note,
      adminHref: adminArticleHref(article.id),
    },
    priority: 'HIGH',
  });

  await queueArticleRejectedEmail({
    userId: article.authorId,
    articleId: article.id,
    articleTitle: article.title,
    slug: article.slug,
    note,
  });
}
