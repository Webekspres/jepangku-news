import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';

export function createAdminStatsRoute<T extends Record<string, number>>(
  getStats: () => Promise<T>,
) {
  return async function GET(request: NextRequest) {
    const admin = await getCurrentAdmin(request);
    if (!admin) {
      return apiError('Admin access required', {
        status: 403,
        code: 'FORBIDDEN',
      });
    }
    const stats = await getStats();
    return apiSuccess(stats, { message: 'Stats retrieved successfully.' });
  };
}
