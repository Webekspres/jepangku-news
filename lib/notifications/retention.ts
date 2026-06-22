import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { NOTIFICATION_RETENTION_DAYS } from '@/lib/notifications/types';

export type PurgeExpiredNotificationsResult = {
  deleted: number;
};

/**
 * Delete notifications past `expires_at`, or older than retention when `expires_at` is null.
 */
export async function purgeExpiredNotifications(
  now: Date = new Date(),
): Promise<PurgeExpiredNotificationsResult> {
  const fallbackCutoff = new Date(now);
  fallbackCutoff.setDate(fallbackCutoff.getDate() - NOTIFICATION_RETENTION_DAYS);

  const result = await db.notification.deleteMany({
    where: {
      OR: [
        { expiresAt: { lte: now } },
        {
          expiresAt: null,
          createdAt: { lte: fallbackCutoff },
        },
      ],
    },
  });

  if (result.count > 0) {
    logger.info('notification.retention.purged', {
      deleted: result.count,
      cutoff: now.toISOString(),
    });
  }

  return { deleted: result.count };
}
