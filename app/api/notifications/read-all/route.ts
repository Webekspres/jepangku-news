import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { captureException } from '@/lib/monitoring';
import { markAllNotificationsRead } from '@/lib/notifications/queries';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return apiError('Not authenticated' , { status: 401 });
    }

    const updated = await markAllNotificationsRead(user.id);
    return apiSuccess({ updated });
  } catch (e) {
    await captureException(e, { route: 'notifications-read-all' });
    return apiError('Gagal menandai semua notifikasi' , { status: 500 });
  }
}
