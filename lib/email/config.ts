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

export function getQstashToken(): string | null {
  return process.env.QSTASH_TOKEN?.trim() || null;
}
