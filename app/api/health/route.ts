
import { apiError, apiSuccess } from '@/lib/api-response';
import { db } from '@/lib/db';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async () => {
  const timestamp = new Date().toISOString();

  try {
    await db.$queryRaw`SELECT 1`;
    return apiSuccess({ status: 'ok', db: 'ok', timestamp });
  } catch {
    return apiError('Database unavailable', {
      status: 503,
      code: 'SERVICE_DEGRADED',
      meta: { status: 'degraded', db: 'error', timestamp },
    });
  }
});

export { GET };
