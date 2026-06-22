import { SITE_BRAND_NAME } from '@/lib/site-config';

export function isEmailConfigured(): boolean {
  return Boolean(getResendApiKey() && getEmailFromAddress());
}

export function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY?.trim() || null;
}

export function getEmailFromAddress(): string | null {
  return process.env.EMAIL_FROM?.trim() || null;
}

export function getEmailReplyTo(): string | null {
  return process.env.EMAIL_REPLY_TO?.trim() || null;
}

/** Resend `from` header, e.g. `jepangKu <notifications@jepangku.com>`. */
export function getEmailFromHeader(): string | null {
  const from = getEmailFromAddress();
  if (!from) return null;
  const name = process.env.EMAIL_FROM_NAME?.trim() || SITE_BRAND_NAME;
  return `${name} <${from}>`;
}

export function getEmailQueueSecret(): string | null {
  return process.env.EMAIL_QUEUE_SECRET?.trim() || null;
}

const DEFAULT_QSTASH_URL = 'https://qstash.upstash.io';

export function getQstashUrl(): string {
  const raw = process.env.QSTASH_URL?.trim();
  if (!raw) return DEFAULT_QSTASH_URL;
  return raw.replace(/\/$/, '');
}

export function getQstashToken(): string | null {
  return process.env.QSTASH_TOKEN?.trim() || null;
}

export function getQstashCurrentSigningKey(): string | null {
  return process.env.QSTASH_CURRENT_SIGNING_KEY?.trim() || null;
}

export function getQstashNextSigningKey(): string | null {
  return process.env.QSTASH_NEXT_SIGNING_KEY?.trim() || null;
}

export function isQstashConfigured(): boolean {
  return Boolean(getQstashToken());
}

/** QStash cannot reach localhost — skip publish in dev unless explicitly enabled. */
export function shouldPublishEmailViaQstash(): boolean {
  if (!isQstashConfigured()) return false;
  if (process.env.NODE_ENV === 'development') {
    return process.env.QSTASH_PUBLISH_IN_DEV === 'true';
  }
  return true;
}

export function isQstashReceiverConfigured(): boolean {
  return Boolean(getQstashCurrentSigningKey() && getQstashNextSigningKey());
}
