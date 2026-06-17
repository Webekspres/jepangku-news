import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { captureException } from '@/lib/monitoring';
import {
  listNotificationsForUser,
  parseNotificationListQuery,
} from '@/lib/notifications/queries';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { limit, cursor, unreadOnly } = parseNotificationListQuery(
      request.nextUrl.searchParams,
    );

    const { items, nextCursor } = await listNotificationsForUser(user.id, {
      limit,
      cursor,
      unreadOnly,
    });

    return NextResponse.json({
      items,
      nextCursor,
    });
  } catch (e) {
    await captureException(e, { route: 'notifications-list' });
    return NextResponse.json({ error: 'Gagal memuat notifikasi' }, { status: 500 });
  }
}
