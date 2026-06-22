import { db } from '@/lib/db';
import {
  parseAnalyticsPeriod,
  periodStartDate,
  type AnalyticsPeriod,
} from '@/lib/analytics';
import { ACTIVITY_LABELS } from '@/lib/activity-labels';
import {
  enrichAdminPointTransactions,
  type AdminPointTransaction,
} from '@/lib/admin/point-transactions';
import { fetchLeaderboard } from '@/lib/leaderboard/queries';
import {
  getPeriodBounds,
  LEADERBOARD_PERIOD_LABELS,
  parseLeaderboardPeriod,
} from '@/lib/leaderboard/period';

const SOURCE_APP = 'news';
const PAGE_SIZE = 25;

export type AdminAuditEntry = {
  id: string;
  category: string;
  action: string;
  summary: string;
  actor: {
    id: string;
    name: string;
    username: string;
  } | null;
  target: {
    id: string | null;
    label: string | null;
    href: string | null;
  };
  note: string | null;
  occurredAt: string;
};

export async function getAdminActivityLog(options: {
  page?: number;
  category?: string;
}) {
  const page = Math.max(1, options.page ?? 1);
  const take = PAGE_SIZE;
  const skip = (page - 1) * take;
  const categoryFilter = options.category?.trim();

  const where = categoryFilter ? { category: categoryFilter } : undefined;

  const [rows, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      skip,
      take,
      include: {
        actor: { select: { id: true, name: true, username: true } },
      },
    }),
    db.auditLog.count({ where }),
  ]);

  const entries: AdminAuditEntry[] = rows.map((row) => ({
    id: row.id,
    category: row.category,
    action: row.action,
    summary: row.summary,
    actor: row.actor,
    target: {
      id: row.targetId,
      label: row.targetLabel,
      href: row.targetHref,
    },
    note: row.note,
    occurredAt: row.occurredAt.toISOString(),
  }));

  return {
    entries,
    page,
    totalPages: Math.max(1, Math.ceil(total / take)),
    total,
  };
}

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

function weekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function countByWeek(dates: Date[], weeks: number) {
  const keys: string[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    keys.push(weekKey(d));
  }
  const uniqueKeys = [...new Set(keys)];
  const counts = new Map(uniqueKeys.map((k) => [k, 0]));
  for (const dt of dates) {
    const key = weekKey(dt);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return uniqueKeys.map((date) => ({ date, count: counts.get(date) ?? 0 }));
}

export async function getAdminLeaderboardMonitor(
  periodParam: string | null,
  limit = 50,
) {
  const period = parseLeaderboardPeriod(periodParam);
  const leaderboard = await fetchLeaderboard(period, limit);
  const bounds = getPeriodBounds(period);

  const statsRow = bounds
    ? await db.$queryRaw<
        { participants: bigint; total_period_points: bigint; total_all_points: bigint }[]
      >`
        SELECT
          COUNT(DISTINCT CASE
            WHEN pt.occurred_at >= ${bounds.start} AND pt.occurred_at <= ${bounds.end}
            THEN pt.user_id
          END)::bigint AS participants,
          COALESCE(SUM(CASE
            WHEN pt.occurred_at >= ${bounds.start} AND pt.occurred_at <= ${bounds.end}
            THEN pt.points ELSE 0
          END), 0)::bigint AS total_period_points,
          COALESCE(SUM(pt.points), 0)::bigint AS total_all_points
        FROM point_transactions pt
        INNER JOIN users u ON u.id = pt.user_id
        WHERE pt.source_app = ${SOURCE_APP}
          AND u.status = 'active'
      `
    : await db.$queryRaw<
        { participants: bigint; total_period_points: bigint; total_all_points: bigint }[]
      >`
        SELECT
          COUNT(DISTINCT pt.user_id)::bigint AS participants,
          COALESCE(SUM(pt.points), 0)::bigint AS total_period_points,
          COALESCE(SUM(pt.points), 0)::bigint AS total_all_points
        FROM point_transactions pt
        INNER JOIN users u ON u.id = pt.user_id
        WHERE pt.source_app = ${SOURCE_APP}
          AND u.status = 'active'
      `;

  const stats = statsRow[0];
  const periodPoints = leaderboard.items.reduce((sum, item) => sum + item.periodPoints, 0);

  return {
    ...leaderboard,
    periodLabel: LEADERBOARD_PERIOD_LABELS[period],
    stats: {
      participants: Number(stats?.participants ?? 0),
      topListPeriodPoints: periodPoints,
      totalPeriodPoints: Number(stats?.total_period_points ?? 0),
      totalAllTimePoints: Number(stats?.total_all_points ?? 0),
    },
  };
}

export async function getAdminPointsSummary(periodParam: string | null) {
  const period = parseAnalyticsPeriod(periodParam);
  const since = periodStartDate(period);

  const where = {
    sourceApp: SOURCE_APP,
    ...(since ? { occurredAt: { gte: since } } : {}),
  };

  const [totalAgg, count, byType, recent, transactions] = await Promise.all([
    db.pointTransaction.aggregate({
      where,
      _sum: { points: true },
    }),
    db.pointTransaction.count({ where }),
    db.pointTransaction.groupBy({
      by: ['activityType'],
      where,
      _sum: { points: true },
      _count: { id: true },
      orderBy: { _sum: { points: 'desc' } },
    }),
    db.pointTransaction.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      take: 20,
      select: {
        id: true,
        activityType: true,
        sourceType: true,
        sourceId: true,
        points: true,
        description: true,
        occurredAt: true,
        user: { select: { id: true, name: true, username: true, email: true } },
      },
    }),
    db.pointTransaction.findMany({
      where,
      select: { occurredAt: true, points: true },
      orderBy: { occurredAt: 'asc' },
    }),
  ]);

  const dayCount = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
  const dayKeys = lastNDays(dayCount);
  const pointsByDay = countByDay(
    transactions.map((tx) => tx.occurredAt),
    dayKeys,
  );

  const pointsSumByDay = (() => {
    const sums = new Map(dayKeys.map((d) => [d, 0]));
    for (const tx of transactions) {
      const day = tx.occurredAt.toISOString().slice(0, 10);
      if (sums.has(day)) sums.set(day, (sums.get(day) ?? 0) + tx.points);
    }
    return dayKeys.map((date) => ({ date, count: sums.get(date) ?? 0 }));
  })();

  return {
    period,
    totalPoints: totalAgg._sum.points ?? 0,
    transactionCount: count,
    breakdown: byType.map((row) => {
      const baseType = row.activityType.replace(/_\d+$/, '');
      return {
        activityType: row.activityType,
        label: ACTIVITY_LABELS[baseType] ?? row.activityType,
        totalPoints: row._sum.points ?? 0,
        count: row._count.id,
      };
    }),
    pointsByDay: pointsSumByDay,
    transactionsByDay: pointsByDay,
    recentTransactions: await enrichAdminPointTransactions(recent),
  };
}

export type { AdminPointTransaction };


export async function getUserGrowthSeries(options: {
  period?: AnalyticsPeriod;
  granularity?: 'day' | 'week';
}) {
  const period = options.period ?? '30d';
  const granularity = options.granularity ?? 'day';
  const since = periodStartDate(period);

  const users = await db.user.findMany({
    where: since ? { createdAt: { gte: since } } : undefined,
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const dayCount =
    period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;

  const series =
    granularity === 'week'
      ? countByWeek(
          users.map((u) => u.createdAt),
          Math.max(4, Math.ceil(dayCount / 7)),
        )
      : countByDay(
          users.map((u) => u.createdAt),
          period === 'all' ? lastNDays(30) : lastNDays(dayCount),
        );

  const totalUsers = await db.user.count();
  const newInPeriod = users.length;

  return {
    period,
    granularity,
    series,
    totalUsers,
    newInPeriod,
  };
}
