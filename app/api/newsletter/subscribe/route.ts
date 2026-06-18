import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import {
  isValidNewsletterEmail,
  normalizeNewsletterEmail,
  subscribeToNewsletter,
} from '@/lib/newsletter';

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, 'newsletter:subscribe', {
    max: 5,
    windowMs: 60_000,
    message: 'Terlalu banyak percobaan. Coba lagi nanti.',
  });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const rawEmail = typeof body?.email === 'string' ? body.email : '';

  if (!isValidNewsletterEmail(rawEmail)) {
    return NextResponse.json({ error: 'Alamat email tidak valid' }, { status: 400 });
  }

  const email = normalizeNewsletterEmail(rawEmail);
  const user = await getCurrentUser(request).catch(() => null);
  const userId =
    user && normalizeNewsletterEmail(user.email) === email ? user.id : null;

  await subscribeToNewsletter(email, userId);

  return NextResponse.json({
    ok: true,
    message: 'Terima kasih! Periksa inbox Anda untuk konfirmasi langganan.',
  });
}
