
import { apiSuccess } from '@/lib/api-response';
import { clearCoreSessionCookie } from '@/lib/core/session';
import { withRequestLogging } from '@/lib/logging/request-logger';

const POST = withRequestLogging(async () => {
  await clearCoreSessionCookie();
  return apiSuccess({ ok: true });
});

export { POST };
