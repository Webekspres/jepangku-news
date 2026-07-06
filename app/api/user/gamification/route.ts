import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { getUserPointBalance } from '@/lib/points';

export const dynamic = 'force-dynamic';

/** Live portal point balance from News DB — for Navbar refresh. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Not authenticated' , { status: 401 });
  }

  const totalPoints = await getUserPointBalance(user.id);

  return apiSuccess({
    totalPoints,
  });
}
