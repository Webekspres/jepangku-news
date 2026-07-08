import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { captureException } from '@/lib/monitoring';
import { markNotificationRead } from '@/lib/notifications/queries';
import { withRequestLogging } from '@/lib/logging/request-logger';

const PATCH = withRequestLogging(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return apiError('Not authenticated' , { status: 401 });
    }

    const { id } = await params;
    const notification = await markNotificationRead(user.id, id);
    if (!notification) {
      return apiError('Notifikasi tidak ditemukan' , { status: 404 });
    }

    return apiSuccess({ notification });
  } catch (e) {
    await captureException(e, { route: 'notifications-mark-read' });
    return apiError('Gagal menandai notifikasi' , { status: 500 });
  }
});

export { PATCH };
