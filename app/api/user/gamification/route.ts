import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { getUserPointBalance } from '@/lib/points';
import { withRequestLogging } from '@/lib/logging/request-logger';

export const dynamic = 'force-dynamic';

/** Live portal point balance from News DB — for Navbar refresh. */
const GET = withRequestLogging(async (request: NextRequest) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Not authenticated' , { status: 401 });
  }

  const totalPoints = await getUserPointBalance(user.id);

  return apiSuccess({
    totalPoints,
  });
});

export { GET };
