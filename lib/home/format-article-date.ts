import { formatPublishedDateWib } from '@/lib/articles/format-published-date';

export function formatArticleDate(
  value: Date | string | null | undefined,
): string {
  return formatPublishedDateWib(value);
}
