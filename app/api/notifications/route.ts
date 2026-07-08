import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { captureException } from '@/lib/monitoring';
import {
  listNotificationsForUser,
  parseNotificationListQuery,
} from '@/lib/notifications/queries';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async (request: NextRequest) => {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return apiError('Not authenticated' , { status: 401 });
    }

    const { limit, cursor, unreadOnly } = parseNotificationListQuery(
      request.nextUrl.searchParams,
    );

    const { items, nextCursor } = await listNotificationsForUser(user.id, {
      limit,
      cursor,
      unreadOnly,
    });

    return apiSuccess({
      items,
      nextCursor,
    });
  } catch (e) {
    await captureException(e, { route: 'notifications-list' });
    return apiError('Gagal memuat notifikasi' , { status: 500 });
  }
});

export { GET };
