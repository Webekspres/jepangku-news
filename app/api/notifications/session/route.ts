import { NextRequest, NextResponse } from 'next/server';
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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await getNotificationSession(user.id);
    return NextResponse.json(session);
  } catch (e) {
    await captureException(e, { route: 'notifications-session' });
    return NextResponse.json({ error: 'Gagal memuat sesi notifikasi' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const dismissWelcome = Boolean(body?.dismissWelcome);
    const dismissDailyPoints = Boolean(body?.dismissDailyPoints);

    if (!dismissWelcome && !dismissDailyPoints) {
      return NextResponse.json(
        { error: 'Tidak ada aksi dismiss yang valid' },
        { status: 400 },
      );
    }

    const session = await dismissNotificationSession(user.id, {
      dismissWelcome,
      dismissDailyPoints,
    });

    return NextResponse.json(session);
  } catch (e) {
    await captureException(e, { route: 'notifications-session-patch' });
    return NextResponse.json({ error: 'Gagal memperbarui sesi notifikasi' }, { status: 500 });
  }
}
