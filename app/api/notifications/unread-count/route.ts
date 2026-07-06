import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { captureException } from '@/lib/monitoring';
import { getUnreadNotificationCount } from '@/lib/notifications/queries';

export async function GET(request: NextRequest) {
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
}
