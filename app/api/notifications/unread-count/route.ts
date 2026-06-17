import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { captureException } from '@/lib/monitoring';
import { getUnreadNotificationCount } from '@/lib/notifications/queries';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const unreadCount = await getUnreadNotificationCount(user.id);
    return NextResponse.json({ unreadCount });
  } catch (e) {
    await captureException(e, { route: 'notifications-unread-count' });
    return NextResponse.json({ error: 'Gagal memuat jumlah notifikasi' }, { status: 500 });
  }
}
