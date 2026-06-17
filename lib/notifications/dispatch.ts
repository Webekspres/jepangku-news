import { logger } from '@/lib/logger';
import type { NewsNotificationEvent } from '@/lib/notifications/types';
import { handleArticleStatusChanged } from '@/lib/notifications/handlers/article';
import { handleContributorReviewed } from '@/lib/notifications/handlers/contributor';
import { handleCommentCreated } from '@/lib/notifications/handlers/comment';

export async function dispatchNotificationEvent(
  event: NewsNotificationEvent,
): Promise<void> {
  switch (event.type) {
    case 'article.status_changed':
      await handleArticleStatusChanged({
        articleId: event.articleId,
        reviewerId: event.reviewerId,
        previousStatus: event.previousStatus,
        newStatus: event.newStatus,
        note: event.note,
      });
      break;
    case 'contributor.reviewed':
      await handleContributorReviewed({
        applicationId: event.applicationId,
        adminId: event.adminId,
        status: event.status,
        adminNote: event.adminNote,
      });
      break;
    case 'comment.created':
      await handleCommentCreated({
        commentId: event.commentId,
        targetType: event.targetType,
        targetId: event.targetId,
        authorId: event.authorId,
        parentId: event.parentId,
      });
      break;
    default: {
      const _exhaustive: never = event;
      void _exhaustive;
    }
  }
}

/** Non-blocking notification dispatch — failures are logged, never thrown to callers. */
export function dispatchNotificationEventSafe(event: NewsNotificationEvent): void {
  void dispatchNotificationEvent(event).catch((error) => {
    logger.warn('notification.failed', {
      eventType: event.type,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
  });
}
