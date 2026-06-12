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

type PortalUserRow = {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
};

type ProfileRow = {
  userId: string;
  displayName: string | null;
};

function buildLeaderboardEntry(
  row: ScoreRow & { rank?: number },
  index: number,
  period: LeaderboardPeriod,
  userById: Map<string, PortalUserRow>,
  profileByUserId: Map<string, ProfileRow>,
): LeaderboardEntry {
  const portalUser = userById.get(row.user_id);
  const profile = profileByUserId.get(row.user_id);
  const portalUsername = portalUser?.username ?? null;
  const periodPoints = toNumber(row.period_points);
  const totalPoints = toNumber(row.total_points);

  return {
    rank: row.rank ?? index + 1,
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
}

async function loadUserMaps(userIds: string[]) {
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

  return {
    userById: new Map(portalUsers.map((u) => [u.id, u])),
    profileByUserId: new Map(profiles.map((p) => [p.userId, p])),
  };
}

type RankedScoreRow = ScoreRow & { rank: bigint | number };

async function fetchViewerScore(
  userId: string,
  period: LeaderboardPeriod,
): Promise<RankedScoreRow | null> {
  const bounds = getPeriodBounds(period);

  if (period === 'all-time') {
    const rows = await db.$queryRaw<RankedScoreRow[]>`
      WITH scores AS (
        SELECT
          pt.user_id,
          SUM(pt.points)::bigint AS period_points,
          SUM(pt.points)::bigint AS total_points,
          MIN(pt.occurred_at) AS first_occurred
        FROM point_transactions pt
        INNER JOIN users u ON u.id = pt.user_id
        WHERE pt.source_app = ${SOURCE_APP}
          AND u.status = 'active'
        GROUP BY pt.user_id
        HAVING SUM(pt.points) > 0
      ),
      ranked AS (
        SELECT
          user_id,
          period_points,
          total_points,
          ROW_NUMBER() OVER (
            ORDER BY period_points DESC, total_points DESC, first_occurred ASC
          )::int AS rank
        FROM scores
      )
      SELECT user_id, period_points, total_points, rank
      FROM ranked
      WHERE user_id = ${userId}
    `;
    return rows[0] ?? null;
  }

  const { start, end } = bounds!;

  const rows = await db.$queryRaw<RankedScoreRow[]>`
    WITH scores AS (
      SELECT
        pt.user_id,
        SUM(CASE
          WHEN pt.occurred_at >= ${start} AND pt.occurred_at <= ${end}
          THEN pt.points ELSE 0
        END)::bigint AS period_points,
        SUM(pt.points)::bigint AS total_points,
        MIN(pt.occurred_at) AS first_occurred
      FROM point_transactions pt
      INNER JOIN users u ON u.id = pt.user_id
      WHERE pt.source_app = ${SOURCE_APP}
        AND u.status = 'active'
      GROUP BY pt.user_id
      HAVING SUM(CASE
        WHEN pt.occurred_at >= ${start} AND pt.occurred_at <= ${end}
        THEN pt.points ELSE 0
      END) > 0
    ),
    ranked AS (
      SELECT
        user_id,
        period_points,
        total_points,
        ROW_NUMBER() OVER (
          ORDER BY period_points DESC, total_points DESC, first_occurred ASC
        )::int AS rank
      FROM scores
    )
    SELECT user_id, period_points, total_points, rank
    FROM ranked
    WHERE user_id = ${userId}
  `;

  return rows[0] ?? null;
}

export async function fetchLeaderboard(
  period: LeaderboardPeriod,
  limit = 10,
  viewerUserId?: string | null,
): Promise<LeaderboardResponse> {
  const scores = await aggregateScores(period, limit);
  if (scores.length === 0) {
    return {
      period,
      periodLabel: LEADERBOARD_PERIOD_LABELS[period],
      items: [],
      currentUser: null,
    };
  }

  const userIds = scores.map((row) => row.user_id);
  const { userById, profileByUserId } = await loadUserMaps(userIds);

  const items: LeaderboardEntry[] = scores.map((row, index) =>
    buildLeaderboardEntry(row, index, period, userById, profileByUserId),
  );

  let currentUser: LeaderboardEntry | null = null;
  if (viewerUserId && !items.some((entry) => entry.userId === viewerUserId)) {
    const viewerScore = await fetchViewerScore(viewerUserId, period);
    if (viewerScore) {
      const viewerMaps = await loadUserMaps([viewerUserId]);
      const viewerRank = toNumber(viewerScore.rank);
      currentUser = buildLeaderboardEntry(
        { ...viewerScore, rank: viewerRank },
        viewerRank - 1,
        period,
        viewerMaps.userById,
        viewerMaps.profileByUserId,
      );
    }
  }

  return {
    period,
    periodLabel: LEADERBOARD_PERIOD_LABELS[period],
    items,
    currentUser,
  };
}
