import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getNewsletterSubscriptionByToken, unsubscribeNewsletterForUser } from '@/lib/newsletter';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async (request: NextRequest) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Login diperlukan' , { status: 401 });
  }

  const token = new URL(request.url).searchParams.get('token')?.trim();
  if (!token) {
    return apiError('Token tidak valid' , { status: 400 });
  }

  const subscription = await getNewsletterSubscriptionByToken(token);
  if (!subscription) {
    return apiError('Langganan tidak ditemukan' , { status: 404 });
  }

  if (subscription.email !== user.email.trim().toLowerCase()) {
    logger.warn('newsletter.token_mismatch', { userId: user.id, subscriptionEmail: subscription.email });
    return apiSuccess(
      { error: 'Token tidak cocok dengan akun yang login' },
      { status: 403 },
    );
  }

  logger.info('newsletter.status_checked', { userId: user.id, isActive: subscription.isActive });

  return apiSuccess({
    subscription: {
      email: subscription.email,
      isActive: subscription.isActive,
      subscribedAt: subscription.subscribedAt.toISOString(),
      unsubscribedAt: subscription.unsubscribedAt?.toISOString() ?? null,
    },
  });
});

const DELETE = withRequestLogging(async (request: NextRequest) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Login diperlukan' , { status: 401 });
  }

  const token = new URL(request.url).searchParams.get('token');

  const result = await unsubscribeNewsletterForUser({
    userEmail: user.email,
    token,
  });

  if (!result.ok) {
    logger.warn('newsletter.unsubscribe_failed', { userId: user.id, email: user.email, error: result.error });
    return apiSuccess({ error: result.error ?? 'Gagal berhenti berlangganan' }, {
      status: result.error?.includes('cocok') ? 403 : 404,
    });
  }

  logger.info('newsletter.unsubscribed', { userId: user.id, email: user.email });

  return apiSuccess({ ok: true, message: 'Anda telah berhenti berlangganan newsletter.' });
});

export { GET, DELETE };
