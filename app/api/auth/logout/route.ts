import { clearCoreSessionCookie } from '@/lib/core/session';

export async function POST() {
  await clearCoreSessionCookie();
  return apiSuccess({ ok: true });
}
