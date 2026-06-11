import { logger } from '@/lib/logger';
import { refreshCurrentUserCoreSession } from '@/lib/core/session';
import {
  awardXp,
  buildNewsIdempotencyKey,
  CORE_APPLICATION_PORTAL,
  CoreApiError,
  isCoreAwardConfigured,
  toCoreActivityType,
} from '@/lib/core';

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

/**
 * Award XP/points via jepangku-core (single source of truth).
 * `userId` must be the Clerk User ID (= portal users.id).
 */
export async function awardPoints(
  userId: string,
  activityType: string,
  sourceType: string,
  sourceId: string | null,
  points: number,
  _description?: string,
): Promise<AwardPointsResult> {
  if (points <= 0) return EMPTY_AWARD;

  const coreActivity = toCoreActivityType(activityType);
  if (!coreActivity) {
    logger.warn('core.award.skip_unknown_activity', { activityType });
    return EMPTY_AWARD;
  }

  if (!isCoreAwardConfigured()) {
    logger.warn('core.award.not_configured', { activityType, userId });
    return EMPTY_AWARD;
  }

  const idempotencyKey = buildNewsIdempotencyKey(
    activityType,
    userId,
    sourceId ?? sourceType,
  );

  try {
    const result = await awardXp({
      userId,
      application: CORE_APPLICATION_PORTAL,
      activityType: coreActivity,
      xpGained: points,
      pointsGained: points,
      sourceRefId: sourceId ?? undefined,
      idempotencyKey,
    });

    logger.info('core.award.ok', {
      userId,
      activityType,
      coreActivity,
      points,
      idempotent: result.idempotent,
      currentPoints: result.user.currentPoints,
    });

    if (!result.idempotent) {
      await refreshCurrentUserCoreSession();
    }

    return {
      awarded: !result.idempotent,
      currentPoints: result.user.currentPoints,
      totalXp: result.user.totalXp,
      currentLevel: result.user.currentLevel,
    };
  } catch (error) {
    const meta =
      error instanceof CoreApiError
        ? {
            userId,
            activityType,
            code: error.code,
            status: error.status,
            errorMessage: error.message,
          }
        : {
            userId,
            activityType,
            errorMessage: error instanceof Error ? error.message : 'unknown',
          };
    logger.warn('core.award.failed', meta);
    return EMPTY_AWARD;
  }
}

/** Daily login reward — idempotent via Core idempotency key per calendar day. */
export async function checkDailyLogin(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const result = await awardPoints(userId, 'daily_login', 'system', today, 3);
  return result.awarded;
}
