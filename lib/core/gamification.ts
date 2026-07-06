import { logger } from '@/lib/logger';
import { getCoreServiceToken } from './config';
import { CoreApiError, coreFetch } from './client';
import type { CoreAwardXpInput, CoreAwardXpResponse } from './types';

const log = logger.child({ module: 'core.gamification' });

/** Award XP/points via Core (server-to-server). Requires CORE_SERVICE_TOKEN. */
export async function awardXp(input: CoreAwardXpInput): Promise<CoreAwardXpResponse> {
  const serviceToken = getCoreServiceToken();
  if (!serviceToken) {
    log.warn('core.gamification.award_xp.skipped', {
      reason: 'CORE_SERVICE_TOKEN not configured',
      userId: input.userId,
      xpGained: input.xpGained,
      activityType: input.activityType,
    });
    throw new CoreApiError(
      'CORE_SERVICE_TOKEN_NOT_CONFIGURED',
      'CORE_SERVICE_TOKEN is not set',
      503,
    );
  }

  log.info('core.gamification.award_xp.start', {
    userId: input.userId,
    xpGained: input.xpGained,
    activityType: input.activityType,
    idempotencyKey: input.idempotencyKey,
  });

  try {
    const result = await coreFetch<CoreAwardXpResponse>('/api/v1/gamification/award', {
      method: 'POST',
      bearerToken: serviceToken,
      body: input,
    });

    log.info('core.gamification.award_xp.success', {
      userId: input.userId,
      xpGained: input.xpGained,
      activityType: input.activityType,
      newTotalXp: result.user.totalXp,
      pointsGained: result.user.currentPoints,
      idempotent: result.idempotent,
    });

    return result;
  } catch (error) {
    log.warn('core.gamification.award_xp.failed', {
      userId: input.userId,
      xpGained: input.xpGained,
      activityType: input.activityType,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
    throw error;
  }
}
