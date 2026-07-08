import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { captureException } from '@/lib/monitoring';
import { getUnreadNotificationCount } from '@/lib/notifications/queries';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async (request: NextRequest) => {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return apiError('Not authenticated' , { status: 401 });
    }

    const unreadCount = await getUnreadNotificationCount(user.id);
    return apiSuccess({ unreadCount });
  } catch (e) {
    await captureException(e, { route: 'notifications-unread-count' });
    return apiError('Gagal memuat jumlah notifikasi' , { status: 500 });
  }
});

export { GET };
