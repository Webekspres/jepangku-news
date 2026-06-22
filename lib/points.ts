import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { getJakartaDateKey } from '@/lib/jakarta-calendar';

export type AwardPointsResult = {
  awarded: boolean;
  currentPoints: number | null;
  totalXp: number | null;
  currentLevel: number | null;
};

const EMPTY_AWARD: AwardPointsResult = {
  awarded: false,
  currentPoints: null,
  totalXp: null,
  currentLevel: null,
};

const SOURCE_APP = 'news';

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
  );
}

/** Sum of all portal point transactions for a user. */
export async function getUserPointBalance(userId: string): Promise<number> {
  const result = await db.pointTransaction.aggregate({
    where: { userId, sourceApp: SOURCE_APP },
    _sum: { points: true },
  });
  return result._sum.points ?? 0;
}

/**
 * Award portal points — stored in News DB (`point_transactions`).
 * `userId` must be the Clerk User ID (= portal users.id).
 */
export async function awardPoints(
  userId: string,
  activityType: string,
  sourceType: string,
  sourceId: string | null,
  points: number,
  description?: string,
): Promise<AwardPointsResult> {
  if (points <= 0) return EMPTY_AWARD;

  try {
    await db.pointTransaction.create({
      data: {
        userId,
        sourceApp: SOURCE_APP,
        activityType,
        sourceType,
        sourceId,
        points,
        description: description ?? null,
      },
    });

    const currentPoints = await getUserPointBalance(userId);

    logger.info('points.award.ok', {
      userId,
      activityType,
      points,
      currentPoints,
    });

    return {
      awarded: true,
      currentPoints,
      totalXp: null,
      currentLevel: null,
    };
  } catch (error) {
    if (isUniqueViolation(error)) {
      const currentPoints = await getUserPointBalance(userId);
      return { awarded: false, currentPoints, totalXp: null, currentLevel: null };
    }

    logger.warn('points.award.failed', {
      userId,
      activityType,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
    return EMPTY_AWARD;
  }
}

/** Daily login reward — idempotent via unique constraint per calendar day. */
export async function checkDailyLogin(userId: string): Promise<boolean> {
  const today = getJakartaDateKey();
  const result = await awardPoints(userId, 'daily_login', 'system', today, 3);
  return result.awarded;
}

/** Recent point transactions for a user. */
export async function getUserPointTransactions(userId: string, limit = 100) {
  return db.pointTransaction.findMany({
    where: { userId, sourceApp: SOURCE_APP },
    orderBy: { occurredAt: 'desc' },
    take: limit,
    select: {
      id: true,
      activityType: true,
      sourceType: true,
      sourceId: true,
      points: true,
      description: true,
      occurredAt: true,
    },
  });
}
