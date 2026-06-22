import { db } from '@/lib/db';
import { adminArticleHref } from '@/lib/audit-log';
import { createNotification } from '@/lib/notifications/create';

async function getActiveAdminIds(): Promise<string[]> {
  const admins = await db.user.findMany({
    where: { role: 'ADMIN', status: 'active' },
    select: { id: true },
  });
  return admins.map((admin) => admin.id);
}

export async function notifyAdminsArticlePendingReview(params: {
  articleId: string;
  title: string;
  authorId: string;
  authorName?: string | null;
  previousStatus?: string;
}): Promise<void> {
  const adminIds = await getActiveAdminIds();
  if (adminIds.length === 0) return;

  const author = params.authorName
    ? params.authorName
    : (
        await db.user.findUnique({
          where: { id: params.authorId },
          select: { name: true },
        })
      )?.name;

  const authorLabel = author ? ` oleh ${author}` : '';
  const link = adminArticleHref(params.articleId);
  const dedupeKey = params.previousStatus
    ? `article:${params.articleId}:pending_review:${params.previousStatus}`
    : `article:${params.articleId}:pending_review`;

  await Promise.all(
    adminIds.map((adminId) =>
      createNotification({
        userId: adminId,
        type: 'ARTICLE_PENDING_REVIEW',
        title: 'Artikel menunggu review',
        body: `“${params.title}”${authorLabel} menunggu persetujuan admin.`,
        link,
        dedupeKey,
        metadata: {
          articleId: params.articleId,
          authorId: params.authorId,
          previousStatus: params.previousStatus ?? null,
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
  const adminIds = await getActiveAdminIds();
  if (adminIds.length === 0) return;

  const link = '/admin/contributors';
  const dedupeKey = `contributor_application:${params.applicationId}:pending`;

  await Promise.all(
    adminIds.map((adminId) =>
      createNotification({
        userId: adminId,
        type: 'CONTRIBUTOR_APPLICATION_PENDING',
        title: 'Lamaran kontributor baru',
        body: `${params.applicantName} mengajukan menjadi kontributor.`,
        link,
        dedupeKey,
        metadata: {
          applicationId: params.applicationId,
        },
        priority: 'HIGH',
      }),
    ),
  );
}
