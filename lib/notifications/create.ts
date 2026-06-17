import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
  COMMENT_GROUP_MAX_COUNT,
  COMMENT_GROUP_WINDOW_MS,
  NOTIFICATION_RETENTION_DAYS,
  type CreateNotificationPayload,
  type NotificationCreateResult,
} from '@/lib/notifications/types';
import { publishNotificationUpdateSafe } from '@/lib/notifications/realtime';

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
  );
}

function defaultExpiresAt(): Date {
  const expires = new Date();
  expires.setDate(expires.getDate() + NOTIFICATION_RETENTION_DAYS);
  return expires;
}

export async function createNotification(
  input: CreateNotificationPayload,
): Promise<NotificationCreateResult> {
  const expiresAt = input.expiresAt === undefined ? defaultExpiresAt() : input.expiresAt;

  if (input.groupKey) {
    const grouped = await upsertGroupedNotification(input, expiresAt);
    if (grouped) return grouped;
  }

  try {
    const row = await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
        dedupeKey: input.dedupeKey ?? null,
        groupKey: input.groupKey ?? null,
        priority: input.priority ?? 'NORMAL',
        expiresAt,
      },
      select: { id: true },
    });

    logger.info('notification.dispatched', {
      userId: input.userId,
      notificationId: row.id,
      notificationType: input.type,
      dedupeKey: input.dedupeKey ?? null,
      groupKey: input.groupKey ?? null,
    });

    publishNotificationUpdateSafe(input.userId);

    return { created: true, id: row.id };
  } catch (error) {
    if (isUniqueViolation(error) && input.dedupeKey) {
      logger.info('notification.deduped', {
        userId: input.userId,
        notificationType: input.type,
        dedupeKey: input.dedupeKey,
      });
      return { created: false, id: null, deduped: true };
    }

    logger.warn('notification.failed', {
      userId: input.userId,
      notificationType: input.type,
      dedupeKey: input.dedupeKey ?? null,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
    throw error;
  }
}

async function upsertGroupedNotification(
  input: CreateNotificationPayload,
  expiresAt: Date | null,
): Promise<NotificationCreateResult | null> {
  if (!input.groupKey) return null;

  const windowStart = new Date(Date.now() - COMMENT_GROUP_WINDOW_MS);
  const existing = await db.notification.findFirst({
    where: {
      userId: input.userId,
      groupKey: input.groupKey,
      readAt: null,
      createdAt: { gte: windowStart },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, metadata: true },
  });

  if (!existing) return null;

  const priorCount =
    typeof existing.metadata === 'object' &&
    existing.metadata !== null &&
    !Array.isArray(existing.metadata) &&
    typeof (existing.metadata as Record<string, unknown>).count === 'number'
      ? ((existing.metadata as Record<string, unknown>).count as number)
      : 1;
  const count = priorCount + 1;

  if (count > COMMENT_GROUP_MAX_COUNT) {
    logger.info('notification.group_capped', {
      userId: input.userId,
      groupKey: input.groupKey,
      count,
      max: COMMENT_GROUP_MAX_COUNT,
    });
    return { created: false, id: existing.id, grouped: true };
  }

  await db.notification.update({
    where: { id: existing.id },
    data: {
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      expiresAt,
      metadata: {
        ...(typeof input.metadata === 'object' && input.metadata !== null
          ? input.metadata
          : {}),
        count,
        lastCommentId: (input.metadata as Record<string, unknown> | undefined)
          ?.commentId,
      } as Prisma.InputJsonValue,
    },
  });

  logger.info('notification.dispatched', {
    userId: input.userId,
    notificationId: existing.id,
    notificationType: input.type,
    groupKey: input.groupKey,
    grouped: true,
    count,
  });

  publishNotificationUpdateSafe(input.userId);

  return { created: true, id: existing.id, grouped: true };
}
