import { ACTIVITY_LABELS } from '@/lib/activity-labels';
import { db } from '@/lib/db';

export type AdminPointTransactionUser = {
  id: string;
  name: string;
  username: string;
  email: string;
};

export type AdminPointTransactionSource = {
  type: string;
  typeLabel: string;
  label: string;
  href: string | null;
};

export type AdminPointTransaction = {
  id: string;
  activityType: string;
  activityLabel: string;
  points: number;
  description: string | null;
  occurredAt: string;
  user: AdminPointTransactionUser;
  source: AdminPointTransactionSource;
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  article: 'Artikel',
  poll: 'Polling',
  quiz: 'Kuis',
  system: 'Sistem',
};

function sourceTypeLabel(type: string): string {
  return SOURCE_TYPE_LABELS[type] ?? type;
}

function titleFromDescription(description: string | null, prefix: string): string | null {
  if (!description?.startsWith(prefix)) return null;
  const title = description.slice(prefix.length).trim();
  return title || null;
}

function fallbackSourceLabel(
  sourceType: string,
  sourceId: string | null,
  description: string | null,
  activityType: string,
): string {
  const descFallbacks: Array<[string, string]> = [
    ['Read article: ', 'Artikel'],
    ['Bookmarked article: ', 'Artikel'],
    ['Shared article: ', 'Artikel'],
    ['Voted in poll: ', 'Polling'],
    ['Completed quiz: ', 'Kuis'],
    ['Berkomentar pada article: ', 'Artikel'],
    ['Berkomentar pada poll: ', 'Polling'],
    ['Berkomentar pada quiz: ', 'Kuis'],
  ];

  for (const [prefix] of descFallbacks) {
    const title = titleFromDescription(description, prefix);
    if (title) return title;
  }

  if (sourceType === 'system') {
    return sourceId ? `Login harian (${sourceId})` : 'Login harian';
  }

  const baseType = activityType.replace(/_\d+$/, '');
  return ACTIVITY_LABELS[baseType] ?? sourceTypeLabel(sourceType);
}

function adminHrefForSource(
  sourceType: string,
  sourceId: string | null,
  slug?: string | null,
): string | null {
  if (!sourceId && !slug) return null;
  if (sourceType === 'article' && sourceId) return `/admin/articles/${sourceId}`;
  if (sourceType === 'poll' && slug) return `/admin/polls`;
  if (sourceType === 'quiz' && slug) return `/admin/quizzes`;
  if (sourceType === 'poll') return '/admin/polls';
  if (sourceType === 'quiz') return '/admin/quizzes';
  return null;
}

type RawPointTx = {
  id: string;
  activityType: string;
  sourceType: string;
  sourceId: string | null;
  points: number;
  description: string | null;
  occurredAt: Date;
  user: AdminPointTransactionUser;
};

export async function enrichAdminPointTransactions(
  rows: RawPointTx[],
): Promise<AdminPointTransaction[]> {
  if (rows.length === 0) return [];

  const articleIds = new Set<string>();
  const pollIds = new Set<string>();
  const quizIds = new Set<string>();

  for (const row of rows) {
    if (!row.sourceId) continue;
    if (row.sourceType === 'article') articleIds.add(row.sourceId);
    if (row.sourceType === 'poll') pollIds.add(row.sourceId);
    if (row.sourceType === 'quiz') quizIds.add(row.sourceId);
  }

  const [articles, polls, quizzes] = await Promise.all([
    articleIds.size
      ? db.article.findMany({
          where: { id: { in: [...articleIds] } },
          select: { id: true, title: true, slug: true },
        })
      : Promise.resolve([]),
    pollIds.size
      ? db.poll.findMany({
          where: { id: { in: [...pollIds] } },
          select: { id: true, title: true, slug: true },
        })
      : Promise.resolve([]),
    quizIds.size
      ? db.quiz.findMany({
          where: { id: { in: [...quizIds] } },
          select: { id: true, title: true, slug: true },
        })
      : Promise.resolve([]),
  ]);

  const articleById = new Map(articles.map((a) => [a.id, a]));
  const pollById = new Map(polls.map((p) => [p.id, p]));
  const quizById = new Map(quizzes.map((q) => [q.id, q]));

  return rows.map((row) => {
    const baseType = row.activityType.replace(/_\d+$/, '');
    const activityLabel =
      row.description?.trim() ||
      ACTIVITY_LABELS[baseType] ||
      row.activityType;

    let label = fallbackSourceLabel(
      row.sourceType,
      row.sourceId,
      row.description,
      row.activityType,
    );
    let href: string | null = null;

    if (row.sourceType === 'article' && row.sourceId) {
      const article = articleById.get(row.sourceId);
      if (article) {
        label = article.title;
        href = `/admin/articles/${article.id}`;
      } else {
        href = adminHrefForSource(row.sourceType, row.sourceId);
      }
    } else if (row.sourceType === 'poll' && row.sourceId) {
      const poll = pollById.get(row.sourceId);
      if (poll) {
        label = poll.title;
        href = adminHrefForSource(row.sourceType, row.sourceId, poll.slug);
      } else {
        href = adminHrefForSource(row.sourceType, row.sourceId);
      }
    } else if (row.sourceType === 'quiz' && row.sourceId) {
      const quiz = quizById.get(row.sourceId);
      if (quiz) {
        label = quiz.title;
        href = adminHrefForSource(row.sourceType, row.sourceId, quiz.slug);
      } else {
        href = adminHrefForSource(row.sourceType, row.sourceId);
      }
    } else if (row.sourceType === 'system') {
      label = row.sourceId ? `Login harian · ${row.sourceId}` : 'Login harian';
    }

    return {
      id: row.id,
      activityType: row.activityType,
      activityLabel,
      points: row.points,
      description: row.description,
      occurredAt: row.occurredAt.toISOString(),
      user: row.user,
      source: {
        type: row.sourceType,
        typeLabel: sourceTypeLabel(row.sourceType),
        label,
        href,
      },
    };
  });
}
