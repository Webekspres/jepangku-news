import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { fetchLeaderboard } from '@/lib/leaderboard/queries';
import { parseLeaderboardPeriod } from '@/lib/leaderboard/period';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async (request: NextRequest) => {
  const period = parseLeaderboardPeriod(
    request.nextUrl.searchParams.get('period'),
  );
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = Math.min(Math.max(Number(limitParam ?? 10) || 10, 1), 50);
  const viewer = await getCurrentUser(request).catch(() => null);

  const data = await fetchLeaderboard(period, limit, viewer?.id);

  return apiSuccess(data, { headers: {
      'Cache-Control': viewer
        ? 'private, no-cache'
        : 's-maxage=60, stale-while-revalidate=120',
    } });
});

export { GET };
