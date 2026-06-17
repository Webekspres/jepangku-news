import { db } from '@/lib/db';
import { createNotification } from '@/lib/notifications/create';

export async function notifyAdminsArticlePendingReview(params: {
  articleId: string;
  title: string;
  authorId: string;
}): Promise<void> {
  const admins = await db.user.findMany({
    where: { role: 'ADMIN', status: 'active' },
    select: { id: true },
  });

  const link = `/admin/articles/review`;
  const dedupeKey = `article:${params.articleId}:pending_review`;

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: 'ARTICLE_PENDING_REVIEW',
        title: 'Artikel menunggu review',
        body: `“${params.title}” menunggu persetujuan admin.`,
        link,
        dedupeKey,
        metadata: {
          articleId: params.articleId,
          authorId: params.authorId,
        },
        priority: 'HIGH',
      }),
    ),
  );
}

export async function notifyAdminsContributorApplication(params: {
  applicationId: string;
  applicantName: string;
}): Promise<void> {
  const admins = await db.user.findMany({
    where: { role: 'ADMIN', status: 'active' },
    select: { id: true },
  });

  const link = '/admin/contributors';
  const dedupeKey = `contributor_application:${params.applicationId}:pending`;

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: 'CONTRIBUTOR_APPLICATION_PENDING',
        title: 'Lamaran kontributor baru',
        body: `${params.applicantName} mengajukan menjadi kontributor.`,
        link,
        dedupeKey,
        metadata: {
          applicationId: params.applicationId,
        },
        priority: 'NORMAL',
      }),
    ),
  );
}
