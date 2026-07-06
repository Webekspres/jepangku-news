import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { getContentPerformance, parseAnalyticsPeriod, periodLabel } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { searchParams } = new URL(request.url);
  const period = parseAnalyticsPeriod(searchParams.get('period'));
  const sort = (searchParams.get('sort') || 'views') as 'views' | 'bookmarks' | 'shares';
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 50);

  const rows = await getContentPerformance(
    period,
    sort === 'bookmarks' || sort === 'shares' ? sort : 'views',
    limit,
  );

  return apiSuccess({ period, periodLabel: periodLabel(period), sort, rows });
}
