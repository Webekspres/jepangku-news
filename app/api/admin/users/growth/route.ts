import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { getUserGrowthSeries } from '@/lib/admin-monitoring';
import { parseAnalyticsPeriod } from '@/lib/analytics';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async (request: NextRequest) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return apiError('Admin access required' , { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const period = parseAnalyticsPeriod(searchParams.get('period'));
  const granularity = searchParams.get('granularity') === 'week' ? 'week' : 'day';

  const data = await getUserGrowthSeries({ period, granularity });
  return apiSuccess(data);
});

export { GET };
