import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { captureException } from '@/lib/monitoring';
import { markAllNotificationsRead } from '@/lib/notifications/queries';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const updated = await markAllNotificationsRead(user.id);
    return NextResponse.json({ updated });
  } catch (e) {
    await captureException(e, { route: 'notifications-read-all' });
    return NextResponse.json({ error: 'Gagal menandai semua notifikasi' }, { status: 500 });
  }
}
