import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getEmailQueueSecret, isQstashReceiverConfigured } from '@/lib/email/config';
import { logger } from '@/lib/logger';
import { processEmailOutbox } from '@/lib/email/queue';
import { verifyQstashRequest } from '@/lib/email/qstash';
import { captureException } from '@/lib/monitoring';
import { withRequestLogging } from '@/lib/logging/request-logger';

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

const POST = withRequestLogging(async (request: NextRequest) => {
  const rawBody = await request.text();

  const authorized = await isAuthorized(request, rawBody);
  if (!authorized) {
    logger.warn('internal.email.unauthorized', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      hasUpstashSignature: !!request.headers.get('upstash-signature'),
      payloadSize: rawBody.length,
    });
    return apiError('Unauthorized' , { status: 401 });
  }

  try {
    const body = rawBody ? JSON.parse(rawBody) : {};
    const outboxId = typeof body?.outboxId === 'string' ? body.outboxId.trim() : '';
    if (!outboxId) {
      return apiError('outboxId required' , { status: 400 });
    }

    logger.info('internal.email.process_started', { outboxId, payloadSize: rawBody.length });

    await processEmailOutbox(outboxId);

    logger.info('internal.email.process_completed', { outboxId });
    return apiSuccess({ ok: true, outboxId });
  } catch (e) {
    logger.warn('internal.email.process_failed', { errorMessage: e instanceof Error ? e.message : String(e) });
    await captureException(e, { route: 'internal-email-process' });
    return apiError('Email processing failed' , { status: 500 });
  }
});

export { POST };
