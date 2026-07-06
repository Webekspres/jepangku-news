import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getEmailQueueSecret, isQstashReceiverConfigured } from '@/lib/email/config';
import { processEmailOutbox } from '@/lib/email/queue';
import { verifyQstashRequest } from '@/lib/email/qstash';
import { captureException } from '@/lib/monitoring';

async function isAuthorized(request: NextRequest, rawBody: string): Promise<boolean> {
  const signature =
    request.headers.get('upstash-signature') ?? request.headers.get('Upstash-Signature');

  if (signature && isQstashReceiverConfigured()) {
    const verified = await verifyQstashRequest({ signature, body: rawBody });
    if (verified) return true;
  }

  const secret = getEmailQueueSecret();
  if (secret) {
    const auth = request.headers.get('authorization');
    return auth === `Bearer ${secret}`;
  }

  return process.env.NODE_ENV === 'development';
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!(await isAuthorized(request, rawBody))) {
    return apiError('Unauthorized' , { status: 401 });
  }

  try {
    const body = rawBody ? JSON.parse(rawBody) : {};
    const outboxId = typeof body?.outboxId === 'string' ? body.outboxId.trim() : '';
    if (!outboxId) {
      return apiError('outboxId required' , { status: 400 });
    }

    await processEmailOutbox(outboxId);
    return apiSuccess({ ok: true, outboxId });
  } catch (e) {
    await captureException(e, { route: 'internal-email-process' });
    return apiError('Email processing failed' , { status: 500 });
  }
}
