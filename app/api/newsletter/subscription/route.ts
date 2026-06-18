import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getNewsletterSubscriptionByToken, unsubscribeNewsletterForUser } from '@/lib/newsletter';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 });
  }

  const token = new URL(request.url).searchParams.get('token')?.trim();
  if (!token) {
    return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 });
  }

  const subscription = await getNewsletterSubscriptionByToken(token);
  if (!subscription) {
    return NextResponse.json({ error: 'Langganan tidak ditemukan' }, { status: 404 });
  }

  if (subscription.email !== user.email.trim().toLowerCase()) {
    return NextResponse.json(
      { error: 'Token tidak cocok dengan akun yang login' },
      { status: 403 },
    );
  }

  return NextResponse.json({
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
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 });
  }

  const token = new URL(request.url).searchParams.get('token');

  const result = await unsubscribeNewsletterForUser({
    userEmail: user.email,
    token,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'Gagal berhenti berlangganan' }, {
      status: result.error?.includes('cocok') ? 403 : 404,
    });
  }

  return NextResponse.json({ ok: true, message: 'Anda telah berhenti berlangganan newsletter.' });
}
