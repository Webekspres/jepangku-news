import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { getNewsletterSubscriptionByToken, unsubscribeNewsletterForUser } from '@/lib/newsletter';

export async function GET(request: NextRequest) {
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
    return apiSuccess(
      { error: 'Token tidak cocok dengan akun yang login' },
      { status: 403 },
    );
  }

  return apiSuccess({
    subscription: {
      email: subscription.email,
      isActive: subscription.isActive,
      subscribedAt: subscription.subscribedAt.toISOString(),
      unsubscribedAt: subscription.unsubscribedAt?.toISOString() ?? null,
    },
  });
}

export async function DELETE(request: NextRequest) {
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
    return apiSuccess({ error: result.error ?? 'Gagal berhenti berlangganan' }, {
      status: result.error?.includes('cocok') ? 403 : 404,
    });
  }

  return apiSuccess({ ok: true, message: 'Anda telah berhenti berlangganan newsletter.' });
}
