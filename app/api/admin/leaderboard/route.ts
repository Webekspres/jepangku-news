import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { getAdminLeaderboardMonitor } from '@/lib/admin-monitoring';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return apiError('Admin access required' , { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period');
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50', 10) || 50));

  const data = await getAdminLeaderboardMonitor(period, limit);
  return apiSuccess(data);
}
