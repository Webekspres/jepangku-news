import { Client, Receiver } from '@upstash/qstash';
import {
  getEmailQueueSecret,
  getQstashCurrentSigningKey,
  getQstashNextSigningKey,
  getQstashToken,
  getQstashUrl,
  isQstashConfigured,
} from '@/lib/email/config';

let client: Client | null = null;
let receiver: Receiver | null = null;

export function getQstashClient(): Client | null {
  if (!isQstashConfigured()) return null;

  const token = getQstashToken();
  if (!token) return null;

  if (!client) {
    client = new Client({
      token,
      baseUrl: getQstashUrl(),
    });
  }

  return client;
}

export function getQstashReceiver(): Receiver | null {
  const currentSigningKey = getQstashCurrentSigningKey();
  const nextSigningKey = getQstashNextSigningKey();
  if (!currentSigningKey || !nextSigningKey) return null;

  if (!receiver) {
    receiver = new Receiver({
      currentSigningKey,
      nextSigningKey,
    });
  }

  return receiver;
}

export async function verifyQstashRequest(params: {
  signature: string | null;
  body: string;
}): Promise<boolean> {
  if (!params.signature) return false;

  const qstashReceiver = getQstashReceiver();
  if (!qstashReceiver) return false;

  try {
    return await qstashReceiver.verify({
      signature: params.signature,
      body: params.body,
    });
  } catch {
    return false;
  }
}

export function getEmailProcessHeaders(): Record<string, string> | undefined {
  const secret = getEmailQueueSecret();
  if (!secret) return undefined;
  return { Authorization: `Bearer ${secret}` };
}
