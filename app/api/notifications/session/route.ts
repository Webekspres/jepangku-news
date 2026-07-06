import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { captureException } from '@/lib/monitoring';
import {
  dismissNotificationSession,
  getNotificationSession,
} from '@/lib/notifications/queries';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return apiError('Not authenticated' , { status: 401 });
    }

    const session = await getNotificationSession(user.id);
    return apiSuccess(session);
  } catch (e) {
    await captureException(e, { route: 'notifications-session' });
    return apiError('Gagal memuat sesi notifikasi' , { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return apiError('Not authenticated' , { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const dismissWelcome = Boolean(body?.dismissWelcome);
    const dismissDailyPoints = Boolean(body?.dismissDailyPoints);

    if (!dismissWelcome && !dismissDailyPoints) {
      return apiSuccess(
        { error: 'Tidak ada aksi dismiss yang valid' },
        { status: 400 },
      );
    }

    const session = await dismissNotificationSession(user.id, {
      dismissWelcome,
      dismissDailyPoints,
    });

    return apiSuccess(session);
  } catch (e) {
    await captureException(e, { route: 'notifications-session-patch' });
    return apiError('Gagal memperbarui sesi notifikasi' , { status: 500 });
  }
}
