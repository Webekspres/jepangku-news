import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { getUserActivityFeed } from '@/lib/activity/feed';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Not authenticated' , { status: 401 });
  }

  const limit = Math.min(
    100,
    Math.max(1, Number(new URL(request.url).searchParams.get('limit') || 80)),
  );

  const items = await getUserActivityFeed(user.id, limit);
  return apiSuccess({ items });
}
