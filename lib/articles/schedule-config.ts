import { getEmailQueueSecret } from '@/lib/email/config';

/** Reuse email queue secret for internal article publish callbacks. */
export function getArticleScheduleSecret(): string | null {
  return getEmailQueueSecret();
}

export function getArticleScheduleHeaders(): Record<string, string> | undefined {
  const secret = getArticleScheduleSecret();
  if (!secret) return undefined;
  return { Authorization: `Bearer ${secret}` };
}
