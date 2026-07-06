import { db } from './db';

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';

export function parseAnalyticsPeriod(raw: string | null): AnalyticsPeriod {
  if (raw === '30d' || raw === '90d' || raw === 'all') return raw;
  return '7d';
}

export function periodStartDate(period: AnalyticsPeriod): Date | null {
  if (period === 'all') return null;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function periodLabel(period: AnalyticsPeriod): string {
  const map: Record<AnalyticsPeriod, string> = {
    '7d': '7 hari terakhir',
    '30d': '30 hari terakhir',
    '90d': '90 hari terakhir',
    all: 'Semua waktu',
  };
  return map[period];
}

function _viewedAtFilter(period: AnalyticsPeriod) {
  const since = periodStartDate(period);
  return since ? { gte: since } : undefined;
}

/** Views per hari untuk satu artikel. */
export async function getArticleViewSeries(articleId: string, period: AnalyticsPeriod) {
  const since = periodStartDate(period);
  const views = await db.articleView.findMany({
    where: {
      articleId,
      ...(since ? { viewedAt: { gte: since } } : {}),
    },
    select: { viewedAt: true, visitorKey: true },
    orderBy: { viewedAt: 'asc' },
  });

  const byDay = new Map<string, { total: number; visitors: Set<string> }>();
  for (const v of views) {
    const day = v.viewedAt.toISOString().slice(0, 10);
    const bucket = byDay.get(day) ?? { total: 0, visitors: new Set<string>() };
    bucket.total += 1;
    bucket.visitors.add(v.visitorKey);
    byDay.set(day, bucket);
  }

  const series = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, b]) => ({
      date,
      totalViews: b.total,
      uniqueVisitors: b.visitors.size,
    }));

  const uniqueVisitors = new Set(views.map((v) => v.visitorKey)).size;

  return {
    series,
    totalViews: views.length,
    uniqueVisitors,
  };
}

/** Laporan performa artikel dalam periode. */
export async function getContentPerformance(
  period: AnalyticsPeriod,
  sort: 'views' | 'bookmarks' | 'shares',
  limit: number,
) {
  const since = periodStartDate(period);
  const publishedWhere = { status: 'PUBLISHED' as const, visibility: 'public' };

  const articles = await db.article.findMany({
    where: publishedWhere,
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
      bookmarkCount: true,
      shareCount: true,
      publishedAt: true,
      category: { select: { name: true } },
    },
  });

  const articleIds = articles.map((a) => a.id);

  const [viewGroups, bookmarkGroups, shareGroups] = await Promise.all([
    since
      ? db.articleView.groupBy({
          by: ['articleId'],
          where: { articleId: { in: articleIds }, viewedAt: { gte: since } },
          _count: { id: true },
        })
      : Promise.resolve(
          articles.map((a) => ({ articleId: a.id, _count: { id: a.viewCount } })),
        ),
    since
      ? db.bookmark.groupBy({
          by: ['articleId'],
          where: {
            articleId: { in: articleIds },
            deletedAt: null,
            firstBookmarkedAt: { gte: since },
          },
          _count: { id: true },
        })
      : Promise.resolve(
          articles.map((a) => ({ articleId: a.id, _count: { id: a.bookmarkCount } })),
        ),
    since
      ? db.articleShare.groupBy({
          by: ['articleId'],
          where: { articleId: { in: articleIds }, sharedAt: { gte: since } },
          _count: { id: true },
        })
      : Promise.resolve(
          articles.map((a) => ({ articleId: a.id, _count: { id: a.shareCount } })),
        ),
  ]);

  const viewMap = new Map(viewGroups.map((g) => [g.articleId, g._count.id]));
  const bookmarkMap = new Map(bookmarkGroups.map((g) => [g.articleId, g._count.id]));
  const shareMap = new Map(shareGroups.map((g) => [g.articleId, g._count.id]));

  const rows = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    categoryName: a.category?.name ?? '—',
    publishedAt: a.publishedAt?.toISOString() ?? null,
    periodViews: viewMap.get(a.id) ?? 0,
    periodBookmarks: bookmarkMap.get(a.id) ?? 0,
    periodShares: shareMap.get(a.id) ?? 0,
    lifetimeViews: a.viewCount,
    lifetimeBookmarks: a.bookmarkCount,
    lifetimeShares: a.shareCount,
  }));

  const sortKey =
    sort === 'bookmarks' ? 'periodBookmarks' : sort === 'shares' ? 'periodShares' : 'periodViews';

  rows.sort((a, b) => b[sortKey] - a[sortKey]);

  return rows.slice(0, limit);
}

/** Statistik agregat per kategori. */
export async function getCategoryAnalytics() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, slug: true, color: true },
  });

  const results = await Promise.all(
    categories.map(async (cat) => {
      const agg = await db.article.aggregate({
        where: { categoryId: cat.id, status: 'PUBLISHED', visibility: 'public' },
        _count: { id: true },
        _sum: { viewCount: true, bookmarkCount: true, shareCount: true },
      });

      return {
        ...cat,
        articleCount: agg._count.id,
        totalViews: agg._sum.viewCount ?? 0,
        totalBookmarks: agg._sum.bookmarkCount ?? 0,
        totalShares: agg._sum.shareCount ?? 0,
        engagement: (agg._sum.bookmarkCount ?? 0) + (agg._sum.shareCount ?? 0),
      };
    }),
  );

  return results.sort((a, b) => b.totalViews - a.totalViews);
}

const PASS_THRESHOLD = 0.7;

/** Statistik detail satu kuis. */
export async function getQuizAnalytics(quizId: string) {
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, title: true, slug: true, status: true, questions: { select: { id: true } } },
  });
  if (!quiz) return null;

  const attempts = await db.quizAttempt.findMany({
    where: { quizId },
    select: {
      score: true,
      totalQuestions: true,
      correctAnswers: true,
      submittedAt: true,
      userId: true,
    },
  });

  const totalAttempts = attempts.length;
  const uniqueUsers = new Set(attempts.map((a) => a.userId)).size;

  const buckets = [
    { label: '0–20%', min: 0, max: 0.2, count: 0 },
    { label: '21–40%', min: 0.21, max: 0.4, count: 0 },
    { label: '41–60%', min: 0.41, max: 0.6, count: 0 },
    { label: '61–80%', min: 0.61, max: 0.8, count: 0 },
    { label: '81–100%', min: 0.81, max: 1.01, count: 0 },
  ];

  let passCount = 0;
  let scoreSum = 0;

  for (const a of attempts) {
    const ratio = a.totalQuestions > 0 ? a.correctAnswers / a.totalQuestions : 0;
    scoreSum += ratio;
    if (ratio >= PASS_THRESHOLD) passCount += 1;
    for (const b of buckets) {
      if (ratio >= b.min && ratio < b.max) {
        b.count += 1;
        break;
      }
    }
  }

  const byDay = new Map<string, number>();
  for (const a of attempts) {
    const day = a.submittedAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  return {
    quiz,
    totalAttempts,
    uniqueUsers,
    passRate: totalAttempts > 0 ? Math.round((passCount / totalAttempts) * 100) : 0,
    averageScorePercent: totalAttempts > 0 ? Math.round((scoreSum / totalAttempts) * 100) : 0,
    scoreDistribution: buckets.map(({ label, count }) => ({ label, count })),
    attemptsByDay: [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
  };
}

/** Statistik detail satu poll. */
export async function getPollAnalytics(pollId: string) {
  const poll = await db.poll.findUnique({
    where: { id: pollId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      pollType: true,
      questions: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          questionText: true,
          options: {
            orderBy: { sortOrder: 'asc' },
            select: { id: true, optionText: true, voteCount: true },
          },
        },
      },
    },
  });
  if (!poll) return null;

  const votes = await db.pollVote.findMany({
    where: { pollId },
    select: { optionId: true, votedAt: true, userId: true },
  });

  const totalVotes = votes.length;
  const uniqueVoters = new Set(votes.map((v) => v.userId)).size;

  const questionStats = poll.questions.map((q) => {
    const qVotes = votes.filter((v) =>
      q.options.some((o) => o.id === v.optionId),
    ).length;
    return {
      id: q.id,
      questionText: q.questionText,
      totalVotes: qVotes,
      options: q.options.map((o) => {
        const liveVotes = votes.filter((v) => v.optionId === o.id).length;
        const base = qVotes > 0 ? qVotes : totalVotes;
        return {
          optionId: o.id,
          optionText: o.optionText,
          votes: liveVotes,
          percent: base > 0 ? Math.round((liveVotes / base) * 100) : 0,
        };
      }),
    };
  });

  const byDay = new Map<string, number>();
  for (const v of votes) {
    const day = v.votedAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  return {
    poll,
    totalVotes,
    uniqueVoters,
    questionStats,
    votesByDay: [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
  };
}

const ARTICLE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Review',
  PUBLISHED: 'Publik',
  REJECTED: 'Ditolak',
  ARCHIVED: 'Arsip',
};

function lastNDays(n: number): string[] {
  const result: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

function countByDay(dates: Date[], dayKeys: string[]) {
  const counts = new Map(dayKeys.map((d) => [d, 0]));
  for (const dt of dates) {
    const day = dt.toISOString().slice(0, 10);
    if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return dayKeys.map((date) => ({ date, count: counts.get(date) ?? 0 }));
}

/** Data ringkas untuk grafik dashboard admin. */
export async function getDashboardChartData() {
  const dayKeys = lastNDays(7);
  const since = new Date(dayKeys[0]);
  since.setHours(0, 0, 0, 0);

  const [statusGroups, views, publishedArticles, categories, recentUsers] = await Promise.all([
    db.article.groupBy({ by: ['status'], _count: { id: true } }),
    db.articleView.findMany({
      where: { viewedAt: { gte: since } },
      select: { viewedAt: true },
    }),
    db.article.findMany({
      where: { status: 'PUBLISHED', publishedAt: { gte: since } },
      select: { publishedAt: true },
    }),
    getCategoryAnalytics(),
    db.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const articleStatus = statusGroups
    .map((g) => ({
      label: ARTICLE_STATUS_LABELS[g.status] ?? g.status,
      value: g._count.id,
    }))
    .sort((a, b) => b.value - a.value);

  const viewsByDay = countByDay(
    views.map((v) => v.viewedAt),
    dayKeys,
  );

  const articlesPublishedByDay = countByDay(
    publishedArticles
      .map((a) => a.publishedAt)
      .filter((d): d is Date => d !== null),
    dayKeys,
  );

  const topCategories = categories.slice(0, 6).map((c) => ({
    label: c.name,
    value: c.totalViews,
  }));

  const totalViews7d = views.length;

  const userRegistrationsByDay = countByDay(
    recentUsers.map((u) => u.createdAt),
    dayKeys,
  );

  return {
    articleStatus,
    viewsByDay,
    articlesPublishedByDay,
    topCategories,
    totalViews7d,
    userRegistrationsByDay,
  };
}
