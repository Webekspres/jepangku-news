import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { captureException } from '@/lib/monitoring';
import { markNotificationRead } from '@/lib/notifications/queries';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const notification = await markNotificationRead(user.id, id);
    if (!notification) {
      return NextResponse.json({ error: 'Notifikasi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ notification });
  } catch (e) {
    await captureException(e, { route: 'notifications-mark-read' });
    return NextResponse.json({ error: 'Gagal menandai notifikasi' }, { status: 500 });
  }
}
