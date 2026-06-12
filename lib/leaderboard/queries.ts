import { db } from '@/lib/db';
import { fallbackUsernameFromCoreUser } from '@/lib/username';
import {
  getPeriodBounds,
  LEADERBOARD_PERIOD_LABELS,
  type LeaderboardPeriod,
} from './period';
import type { LeaderboardEntry, LeaderboardResponse } from './types';

const SOURCE_APP = 'news';

type ScoreRow = {
  user_id: string;
  period_points: bigint | number;
  total_points: bigint | number;
};

async function aggregateScores(
  period: LeaderboardPeriod,
  limit: number,
): Promise<ScoreRow[]> {
  const bounds = getPeriodBounds(period);

  if (period === 'all-time') {
    return db.$queryRaw<ScoreRow[]>`
      SELECT
        pt.user_id,
        SUM(pt.points)::bigint AS period_points,
        SUM(pt.points)::bigint AS total_points
      FROM point_transactions pt
      INNER JOIN users u ON u.id = pt.user_id
      WHERE pt.source_app = ${SOURCE_APP}
        AND u.status = 'active'
      GROUP BY pt.user_id
      HAVING SUM(pt.points) > 0
      ORDER BY period_points DESC, total_points DESC, MIN(pt.occurred_at) ASC
      LIMIT ${limit}
    `;
  }

  const { start, end } = bounds!;

  return db.$queryRaw<ScoreRow[]>`
    SELECT
      pt.user_id,
      SUM(CASE
        WHEN pt.occurred_at >= ${start} AND pt.occurred_at <= ${end}
        THEN pt.points ELSE 0
      END)::bigint AS period_points,
      SUM(pt.points)::bigint AS total_points
    FROM point_transactions pt
    INNER JOIN users u ON u.id = pt.user_id
    WHERE pt.source_app = ${SOURCE_APP}
      AND u.status = 'active'
    GROUP BY pt.user_id
    HAVING SUM(CASE
      WHEN pt.occurred_at >= ${start} AND pt.occurred_at <= ${end}
      THEN pt.points ELSE 0
    END) > 0
    ORDER BY period_points DESC, total_points DESC, MIN(pt.occurred_at) ASC
    LIMIT ${limit}
  `;
}

function toNumber(value: bigint | number): number {
  return typeof value === 'bigint' ? Number(value) : value;
}

export async function fetchLeaderboard(
  period: LeaderboardPeriod,
  limit = 10,
): Promise<LeaderboardResponse> {
  const scores = await aggregateScores(period, limit);
  if (scores.length === 0) {
    return {
      period,
      periodLabel: LEADERBOARD_PERIOD_LABELS[period],
      items: [],
    };
  }

  const userIds = scores.map((row) => row.user_id);

  const [portalUsers, profiles] = await Promise.all([
    db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, username: true, avatarUrl: true },
    }),
    db.userProfile.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, displayName: true },
    }),
  ]);

  const userById = new Map(portalUsers.map((u) => [u.id, u]));
  const profileByUserId = new Map(profiles.map((p) => [p.userId, p]));

  const items: LeaderboardEntry[] = scores.map((row, index) => {
    const portalUser = userById.get(row.user_id);
    const profile = profileByUserId.get(row.user_id);
    const portalUsername = portalUser?.username ?? null;
    const periodPoints = toNumber(row.period_points);
    const totalPoints = toNumber(row.total_points);

    return {
      rank: index + 1,
      userId: row.user_id,
      displayName:
        profile?.displayName ||
        portalUsername ||
        portalUser?.name ||
        'Pengguna',
      username:
        portalUsername ||
        fallbackUsernameFromCoreUser({
          id: row.user_id,
          name: portalUser?.name ?? 'user',
        }),
      profileLinked: Boolean(portalUsername),
      avatarUrl: portalUser?.avatarUrl ?? null,
      periodPoints,
      totalPoints,
      period,
    };
  });

  return {
    period,
    periodLabel: LEADERBOARD_PERIOD_LABELS[period],
    items,
  };
}
