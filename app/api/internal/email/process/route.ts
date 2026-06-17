import { NextRequest, NextResponse } from 'next/server';
import { getEmailQueueSecret } from '@/lib/email/config';
import { processEmailOutbox } from '@/lib/email/queue';
import { captureException } from '@/lib/monitoring';

function isAuthorized(request: NextRequest): boolean {
  const secret = getEmailQueueSecret();
  if (!secret) {
    return process.env.NODE_ENV === 'development';
  }
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const outboxId = typeof body?.outboxId === 'string' ? body.outboxId.trim() : '';
    if (!outboxId) {
      return NextResponse.json({ error: 'outboxId required' }, { status: 400 });
    }

    await processEmailOutbox(outboxId);
    return NextResponse.json({ ok: true, outboxId });
  } catch (e) {
    await captureException(e, { route: 'internal-email-process' });
    return NextResponse.json({ error: 'Email processing failed' }, { status: 500 });
  }
}
