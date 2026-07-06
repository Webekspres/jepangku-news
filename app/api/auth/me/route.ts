import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { authenticateRequestUser, withCoreSessionCookie } from '@/lib/auth';
import { withRequestLogging } from '@/lib/logging/request-logger';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const GET = withRequestLogging(async (request: NextRequest) => {
  const result = await authenticateRequestUser(request);
  if (!result) {
    logger.warn('auth.me.unauthenticated', {
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: request.headers.get('user-agent'),
    });
    return apiError('Not authenticated' , { status: 401 });
  }

  logger.info('auth.me.success', {
    userId: result.user.id,
    username: result.user.username,
    role: result.user.role,
    hasClerkToken: !!result.clerkToken,
  });

  const response = apiSuccess(result.user, { message: 'Session retrieved successfully.' });
  if (result.clerkToken) {
    return withCoreSessionCookie(response, result.clerkToken);
  }
  return response;
});

export { GET };
