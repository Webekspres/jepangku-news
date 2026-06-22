import { db } from '@/lib/db';
import { getArticleViewHref } from '@/lib/article-view-url';
import { isEmailConfigured } from '@/lib/email/config';
import { queueEmailSafe } from '@/lib/email/queue';
import { logger } from '@/lib/logger';
import { displayNameFromEmail } from '@/lib/newsletter';
import { toAbsoluteUrl } from '@/lib/site-url';
import { SITE_BRAND_NAME } from '@/lib/site-config';

export async function queueNewsletterNewArticleBroadcast(articleId: string): Promise<void> {
  if (!isEmailConfigured()) return;

  const article = await db.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      status: true,
      coverImageUrl: true,
      authorId: true,
      author: { select: { email: true } },
      category: { select: { name: true } },
    },
  });

  if (!article || article.status !== 'PUBLISHED') return;

  const authorEmail = article.author.email.trim().toLowerCase();

  const subscriptions = await db.newsletterSubscription.findMany({
    where: {
      isActive: true,
      ...(authorEmail ? { email: { not: authorEmail } } : {}),
    },
    select: {
      id: true,
      email: true,
      userId: true,
      unsubscribeToken: true,
    },
  });

  if (subscriptions.length === 0) return;

  const articleUrl = toAbsoluteUrl(
    getArticleViewHref({
      id: article.id,
      slug: article.slug,
      status: article.status,
    }),
  );

  const excerpt =
    article.excerpt?.trim() ||
    `Artikel baru${article.category?.name ? ` di kategori ${article.category.name}` : ''} dari ${SITE_BRAND_NAME}.`;

  const coverImageUrl = article.coverImageUrl
    ? toAbsoluteUrl(article.coverImageUrl)
    : null;

  let queued = 0;

  for (const subscription of subscriptions) {
    const unsubscribeUrl = toAbsoluteUrl(
      `/newsletter/unsubscribe?token=${encodeURIComponent(subscription.unsubscribeToken)}`,
    );

    queueEmailSafe({
      userId: subscription.userId ?? article.authorId,
      toEmail: subscription.email,
      template: 'newsletter_new_article',
      subject: `Artikel baru: ${article.title}`,
      dedupeKey: `email:newsletter_new_article:${article.id}:${subscription.id}`,
      payload: {
        userName: displayNameFromEmail(subscription.email),
        articleTitle: article.title,
        excerpt,
        articleUrl,
        unsubscribeUrl,
        coverImageUrl,
        categoryName: article.category?.name ?? null,
      },
    });
    queued += 1;
  }

  logger.info('newsletter.new_article_broadcast.queued', {
    articleId: article.id,
    recipientCount: queued,
  });
}

export function queueNewsletterNewArticleBroadcastSafe(articleId: string): void {
  void queueNewsletterNewArticleBroadcast(articleId).catch((error) => {
    logger.warn('newsletter.new_article_broadcast.failed', {
      articleId,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
  });
}
