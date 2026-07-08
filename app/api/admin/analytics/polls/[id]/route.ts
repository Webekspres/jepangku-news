import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { getPollAnalytics } from '@/lib/analytics';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;
  const data = await getPollAnalytics(id);
  if (!data) {
    return apiError('Polling tidak ditemukan' , { status: 404 });
  }

  return apiSuccess(data);
});

export { GET };
