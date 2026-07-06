import { apiError, apiSuccess } from '@/lib/api-response';
import { authenticateRequestUser, withCoreSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const result = await authenticateRequestUser(request);
  if (!result) {
    return apiError('Not authenticated' , { status: 401 });
  }

  const response = apiSuccess(result.user, { message: 'Session retrieved successfully.' });
  if (result.clerkToken) {
    return withCoreSessionCookie(response, result.clerkToken);
  }
  return response;
}
