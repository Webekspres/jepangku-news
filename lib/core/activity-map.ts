/** Map portal `lib/points.ts` activity strings → Core `activity_types.code`. */

export const PORTAL_TO_CORE_ACTIVITY: Record<string, string> = {
  article_read: 'READ_ARTICLE',
  article_shared: 'ARTICLE_SHARED',
  article_bookmarked: 'ARTICLE_BOOKMARKED',
  quiz_completed: 'NEWS_QUIZ_COMPLETED',
  quiz_correct_answers: 'NEWS_QUIZ_COMPLETED',
  poll_voted: 'POLL_VOTED',
  comment_created: 'COMMENT_CREATED',
  daily_login: 'DAILY_LOGIN',
};

export function toCoreActivityType(portalActivity: string): string | null {
  return PORTAL_TO_CORE_ACTIVITY[portalActivity] ?? null;
}

/** Stable idempotency keys for Portal Berita awards. */
export function buildNewsIdempotencyKey(
  kind: string,
  clerkId: string,
  ...parts: (string | null | undefined)[]
): string {
  const suffix = parts.filter(Boolean).join(':');
  return suffix ? `news:${kind}:${suffix}:${clerkId}` : `news:${kind}:${clerkId}`;
}
