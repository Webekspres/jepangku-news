import type { NextRequest } from 'next/server';
import { isQstashReceiverConfigured } from '@/lib/email/config';
import { verifyQstashRequest } from '@/lib/email/qstash';

export async function isInternalQueueRequestAuthorized(
  request: NextRequest,
  rawBody: string,
  secret: string | null,
): Promise<boolean> {
  const signature =
    request.headers.get('upstash-signature') ?? request.headers.get('Upstash-Signature');

  if (signature && isQstashReceiverConfigured()) {
    const verified = await verifyQstashRequest({ signature, body: rawBody });
    if (verified) return true;
  }

  if (secret) {
    const auth = request.headers.get('authorization');
    return auth === `Bearer ${secret}`;
  }

  return process.env.NODE_ENV === 'development';
}
