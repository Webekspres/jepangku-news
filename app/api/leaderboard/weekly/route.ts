import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api-response';
import { fetchLeaderboard } from '@/lib/leaderboard/queries';
import { parseLeaderboardPeriod } from '@/lib/leaderboard/period';
import { withRequestLogging } from '@/lib/logging/request-logger';

/** Back-compat: `/weekly` accepts `?period=monthly|all-time` or defaults to weekly. */
const GET = withRequestLogging(async (request: NextRequest) => {
  const period = parseLeaderboardPeriod(
    request.nextUrl.searchParams.get('period') ?? 'weekly',
  );
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = Math.min(Math.max(Number(limitParam ?? 10) || 10, 1), 50);

  const data = await fetchLeaderboard(period, limit);

  return apiSuccess(
    data.items.map((entry) => ({
      ...entry,
      totalXp: entry.totalPoints,
      currentPoints: entry.totalPoints,
    })),
    {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
      },
    },
  );
});

export { GET };
