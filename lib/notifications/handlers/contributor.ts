import { db } from '@/lib/db';
import { createNotification } from '@/lib/notifications/create';
import { queueContributorReviewEmail } from '@/lib/notifications/email-hooks';

export async function handleContributorReviewed(params: {
  applicationId: string;
  adminId: string;
  status: 'APPROVED' | 'REJECTED';
  adminNote?: string | null;
}): Promise<void> {
  const application = await db.contributorApplication.findUnique({
    where: { id: params.applicationId },
    select: {
      id: true,
      userId: true,
      user: { select: { name: true } },
    },
  });
  if (!application) return;

  const note = params.adminNote?.trim() || null;

  if (params.status === 'APPROVED') {
    await createNotification({
      userId: application.userId,
      type: 'CONTRIBUTOR_APPROVED',
      title: 'Lamaran kontributor disetujui',
      body: note
        ? `Selamat! Anda sekarang dapat menulis artikel. Catatan: ${note}`
        : 'Selamat! Anda sekarang dapat menulis dan mengirim artikel di Jepangku.',
      link: '/submit-article',
      dedupeKey: `contributor:${params.applicationId}:approved`,
      metadata: {
        applicationId: params.applicationId,
        adminId: params.adminId,
        note,
      },
      priority: 'HIGH',
    });
    await queueContributorReviewEmail({
      userId: application.userId,
      applicationId: params.applicationId,
      status: 'APPROVED',
      adminNote: note,
    });
    return;
  }

  await createNotification({
    userId: application.userId,
    type: 'CONTRIBUTOR_REJECTED',
    title: 'Lamaran kontributor ditolak',
    body: note
      ? `Lamaran Anda ditolak. Catatan: ${note}`
      : 'Lamaran kontributor Anda ditolak. Anda dapat mengajukan ulang setelah memperbaiki persyaratan.',
    link: '/contributor/apply',
    dedupeKey: `contributor:${params.applicationId}:rejected`,
    metadata: {
      applicationId: params.applicationId,
      adminId: params.adminId,
      note,
    },
    priority: 'HIGH',
  });

  await queueContributorReviewEmail({
    userId: application.userId,
    applicationId: params.applicationId,
    status: 'REJECTED',
    adminNote: note,
  });
}
