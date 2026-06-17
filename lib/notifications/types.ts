import type { ArticleStatus, CommentTargetType } from '@prisma/client';

export const NOTIFICATION_RETENTION_DAYS = 90;
export const COMMENT_GROUP_WINDOW_MS = 15 * 60 * 1000;
export const COMMENT_GROUP_MAX_COUNT = 15;

export type NewsNotificationEvent =
  | {
      type: 'article.status_changed';
      articleId: string;
      reviewerId: string;
      previousStatus: ArticleStatus;
      newStatus: ArticleStatus;
      note?: string | null;
    }
  | {
      type: 'contributor.reviewed';
      applicationId: string;
      adminId: string;
      status: 'APPROVED' | 'REJECTED';
      adminNote?: string | null;
    }
  | {
      type: 'comment.created';
      commentId: string;
      targetType: CommentTargetType;
      targetId: string;
      authorId: string;
      parentId: string | null;
    };

export type CreateNotificationPayload = {
  userId: string;
  type: import('@prisma/client').NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  metadata?: Record<string, unknown>;
  dedupeKey?: string | null;
  groupKey?: string | null;
  priority?: import('@prisma/client').NotificationPriority;
  expiresAt?: Date | null;
};

export type NotificationCreateResult = {
  created: boolean;
  id: string | null;
  deduped?: boolean;
  grouped?: boolean;
};

export type NotificationDto = {
  id: string;
  type: import('@prisma/client').NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  metadata: unknown;
  priority: import('@prisma/client').NotificationPriority;
  readAt: string | null;
  createdAt: string;
};

export type NotificationSessionDto = {
  showDailyPoints: boolean;
  dailyPoints: number;
  showWelcome: boolean;
  jakartaDate: string;
};
