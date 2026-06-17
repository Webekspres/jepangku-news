import type { Notification, Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getJakartaDateKey, getJakartaDayBounds, isWithinJakartaDay } from '@/lib/jakarta-calendar';
import { publishNotificationUpdateSafe } from '@/lib/notifications/realtime';
import type { NotificationDto, NotificationSessionDto } from '@/lib/notifications/types';

export type { NotificationDto, NotificationSessionDto } from '@/lib/notifications/types';

const SOURCE_APP = 'news';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function notExpiredFilter(now: Date): Prisma.NotificationWhereInput {
  return {
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };
}

function toDto(row: Notification): NotificationDto {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    link: row.link,
    metadata: row.metadata ?? null,
    priority: row.priority,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

function parseLimit(raw: string | null): number {
  const n = parseInt(raw || String(DEFAULT_LIMIT), 10);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}

function decodeCursor(cursor: string | null): { createdAt: Date; id: string } | null {
  if (!cursor?.trim()) return null;
  const sep = cursor.lastIndexOf('|');
  if (sep <= 0) return null;
  const createdAt = new Date(cursor.slice(0, sep));
  const id = cursor.slice(sep + 1);
  if (Number.isNaN(createdAt.getTime()) || !id) return null;
  return { createdAt, id };
}

function encodeCursor(row: { createdAt: Date; id: string }): string {
  return `${row.createdAt.toISOString()}|${row.id}`;
}

export async function listNotificationsForUser(
  userId: string,
  options: {
    limit?: number;
    cursor?: string | null;
    unreadOnly?: boolean;
  } = {},
): Promise<{ items: NotificationDto[]; nextCursor: string | null }> {
  const now = new Date();
  const limit = options.limit ?? DEFAULT_LIMIT;
  const decoded = decodeCursor(options.cursor ?? null);

  const where: Prisma.NotificationWhereInput = {
    userId,
    ...notExpiredFilter(now),
    ...(options.unreadOnly ? { readAt: null } : {}),
    ...(decoded
      ? {
          OR: [
            { createdAt: { lt: decoded.createdAt } },
            {
              createdAt: decoded.createdAt,
              id: { lt: decoded.id },
            },
          ],
        }
      : {}),
  };

  const rows = await db.notification.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor =
    hasMore && page.length > 0
      ? encodeCursor(page[page.length - 1]!)
      : null;

  return {
    items: page.map(toDto),
    nextCursor,
  };
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const now = new Date();
  return db.notification.count({
    where: {
      userId,
      readAt: null,
      ...notExpiredFilter(now),
    },
  });
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<NotificationDto | null> {
  const existing = await db.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!existing) return null;
  if (existing.readAt) return toDto(existing);

  const updated = await db.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
  publishNotificationUpdateSafe(userId);
  return toDto(updated);
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const now = new Date();
  const result = await db.notification.updateMany({
    where: {
      userId,
      readAt: null,
      ...notExpiredFilter(now),
    },
    data: { readAt: now },
  });
  if (result.count > 0) {
    publishNotificationUpdateSafe(userId);
  }
  return result.count;
}

export async function dismissNotificationSession(
  userId: string,
  options: { dismissWelcome?: boolean; dismissDailyPoints?: boolean },
  now = new Date(),
): Promise<NotificationSessionDto> {
  const updates: { welcomedAt?: Date; lastDailyPointsModalAt?: Date } = {};
  if (options.dismissWelcome) updates.welcomedAt = now;
  if (options.dismissDailyPoints) updates.lastDailyPointsModalAt = now;

  if (Object.keys(updates).length > 0) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    await db.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: user?.name ?? 'User',
        ...updates,
      },
      update: updates,
    });
  }

  return getNotificationSession(userId, now);
}

export async function getNotificationSession(
  userId: string,
  now = new Date(),
): Promise<NotificationSessionDto> {
  const jakartaDate = getJakartaDateKey(now);
  const { start, end } = getJakartaDayBounds(now);

  const [profile, dailyTx] = await Promise.all([
    db.userProfile.findUnique({
      where: { userId },
      select: { welcomedAt: true, lastDailyPointsModalAt: true },
    }),
    db.pointTransaction.findFirst({
      where: {
        userId,
        sourceApp: SOURCE_APP,
        activityType: 'daily_login',
        occurredAt: { gte: start, lte: end },
      },
      select: { points: true },
      orderBy: { occurredAt: 'desc' },
    }),
  ]);

  const dailyPoints = dailyTx?.points ?? 0;
  const modalShownToday =
    profile?.lastDailyPointsModalAt != null &&
    isWithinJakartaDay(profile.lastDailyPointsModalAt, now);

  return {
    showDailyPoints: dailyPoints > 0 && !modalShownToday,
    dailyPoints,
    showWelcome: profile?.welcomedAt == null,
    jakartaDate,
  };
}

export function parseNotificationListQuery(searchParams: URLSearchParams): {
  limit: number;
  cursor: string | null;
  unreadOnly: boolean;
} {
  return {
    limit: parseLimit(searchParams.get('limit')),
    cursor: searchParams.get('cursor'),
    unreadOnly: searchParams.get('unreadOnly') === 'true',
  };
}
