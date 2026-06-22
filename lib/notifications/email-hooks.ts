import { db } from '@/lib/db';
import { queueEmailSafe } from '@/lib/email/queue';
import { getArticleViewHref } from '@/lib/article-view-url';
import { toAbsoluteUrl } from '@/lib/site-url';

async function userEmail(userId: string): Promise<{ email: string; name: string } | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user?.email) return null;
  return user;
}

export async function queueArticleRejectedEmail(params: {
  userId: string;
  articleId: string;
  articleTitle: string;
  slug: string | null;
  note: string | null;
}): Promise<void> {
  const recipient = await userEmail(params.userId);
  if (!recipient) return;

  const previewUrl = getArticleViewHref({
    id: params.articleId,
    slug: params.slug,
    status: 'REJECTED',
  });

  queueEmailSafe({
    userId: params.userId,
    toEmail: recipient.email,
    template: 'article_rejected',
    subject: `Artikel ditolak: ${params.articleTitle}`,
    dedupeKey: `email:article_rejected:${params.articleId}`,
    payload: {
      userName: recipient.name,
      articleTitle: params.articleTitle,
      note: params.note,
      previewUrl,
    },
  });
}

export async function queueArticleApprovedEmail(params: {
  userId: string;
  articleId: string;
  articleTitle: string;
  slug: string | null;
}): Promise<void> {
  const recipient = await userEmail(params.userId);
  if (!recipient) return;

  const articleUrl = toAbsoluteUrl(
    getArticleViewHref({
      id: params.articleId,
      slug: params.slug,
      status: 'PUBLISHED',
    }),
  );

  queueEmailSafe({
    userId: params.userId,
    toEmail: recipient.email,
    template: 'article_approved',
    subject: `Artikel dipublikasikan: ${params.articleTitle}`,
    dedupeKey: `email:article_approved:${params.articleId}`,
    payload: {
      userName: recipient.name,
      articleTitle: params.articleTitle,
      articleUrl,
    },
  });
}

export async function queueContributorReviewEmail(params: {
  userId: string;
  applicationId: string;
  status: 'APPROVED' | 'REJECTED';
  adminNote?: string | null;
}): Promise<void> {
  const recipient = await userEmail(params.userId);
  if (!recipient) return;

  if (params.status === 'APPROVED') {
    queueEmailSafe({
      userId: params.userId,
      toEmail: recipient.email,
      template: 'contributor_approved',
      subject: 'Lamaran kontributor disetujui — Jepangku',
      dedupeKey: `email:contributor_approved:${params.applicationId}`,
      payload: {
        userName: recipient.name,
        adminNote: params.adminNote ?? null,
        submitUrl: '/submit-article',
      },
    });
    return;
  }

  queueEmailSafe({
    userId: params.userId,
    toEmail: recipient.email,
    template: 'contributor_rejected',
    subject: 'Update lamaran kontributor — Jepangku',
    dedupeKey: `email:contributor_rejected:${params.applicationId}`,
    payload: {
      userName: recipient.name,
      adminNote: params.adminNote ?? null,
      applyUrl: '/contributor/apply',
    },
  });
}

export function queueWelcomeUserEmail(params: {
  userId: string;
  email: string;
  name: string;
}): void {
  queueEmailSafe({
    userId: params.userId,
    toEmail: params.email,
    template: 'welcome_user',
    subject: 'Selamat datang di Jepangku!',
    dedupeKey: `email:welcome:${params.userId}`,
    payload: {
      userName: params.name,
      homeUrl: '/',
      leaderboardUrl: '/leaderboard',
    },
  });
}
