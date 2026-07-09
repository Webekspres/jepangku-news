const JAKARTA_TZ = 'Asia/Jakarta';

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: JAKARTA_TZ,
});

const COMPACT_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: JAKARTA_TZ,
});

export type ArticleTimingInput = {
  status?: string | null;
  publishedAt?: Date | string | null;
  scheduledPublishAt?: Date | string | null;
  createdAt?: Date | string | null;
};

export type ArticleTimingDisplay = {
  kind: 'published' | 'scheduled' | 'submitted' | 'none';
  label: string;
  compact: string;
};

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Published timestamp for public UI — e.g. "10 Juli 2026, 08:00 WIB". */
export function formatPublishedDateWib(
  value: Date | string | null | undefined,
): string {
  const date = toDate(value);
  if (!date) return '';
  return `${DATE_TIME_FORMATTER.format(date)} WIB`;
}

/** Compact list/table format — e.g. "10 Jul 2026, 08.00 WIB". */
export function formatPublishedDateWibCompact(
  value: Date | string | null | undefined,
): string {
  const date = toDate(value);
  if (!date) return '';
  return `${COMPACT_DATE_TIME_FORMATTER.format(date)} WIB`;
}

/** Scheduled publish label for admin UI. */
export function formatScheduledPublishAtWib(
  value: Date | string | null | undefined,
): string {
  const formatted = formatPublishedDateWib(value);
  return formatted ? `Tayang ${formatted}` : '';
}

/** Resolve publish / schedule / submit timing for article list tables. */
export function getArticleTimingDisplay(
  article: ArticleTimingInput,
): ArticleTimingDisplay {
  const status = article.status ?? '';

  if (status === 'PUBLISHED') {
    const publishedAt = toDate(article.publishedAt);
    if (publishedAt) {
      const compact = formatPublishedDateWibCompact(publishedAt);
      return { kind: 'published', label: 'Dipublikasikan', compact };
    }
  }

  if (status === 'SCHEDULED') {
    const scheduledAt = toDate(article.scheduledPublishAt);
    if (scheduledAt) {
      const compact = formatPublishedDateWibCompact(scheduledAt);
      return { kind: 'scheduled', label: 'Terjadwal', compact };
    }
  }

  if (status === 'PENDING_REVIEW') {
    const submittedAt = toDate(article.createdAt);
    if (submittedAt) {
      const compact = formatPublishedDateWibCompact(submittedAt);
      return { kind: 'submitted', label: 'Dikirim review', compact };
    }
  }

  const createdAt = toDate(article.createdAt);
  if (createdAt) {
    const compact = formatPublishedDateWibCompact(createdAt);
    return { kind: 'none', label: 'Dibuat', compact };
  }

  return { kind: 'none', label: '—', compact: '—' };
}
