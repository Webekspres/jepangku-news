import { logger } from '@/lib/logger';
import { coreFetch, CoreApiError } from './client';
import type { CoreLeaderboardResponse, CorePublicUser, CoreUserProfile } from './types';

const log = logger.child({ module: 'core.users' });

export async function fetchCoreLeaderboard(limit = 10, offset = 0): Promise<CoreLeaderboardResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const path = `/api/v1/leaderboard?${params}`;

  log.info('core.leaderboard.fetch', { limit, offset });

  try {
    const result = await coreFetch<CoreLeaderboardResponse>(path);
    log.info('core.leaderboard.fetched', { limit, offset, count: result.items?.length ?? 0 });
    return result;
  } catch (error) {
    log.warn('core.leaderboard.fetch.failed', {
      limit,
      offset,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
    throw error;
  }
}

export async function fetchCoreUserProfile(clerkId: string): Promise<CorePublicUser | null> {
  log.info('core.user_profile.fetch', { clerkId });

  try {
    const result = await coreFetch<CorePublicUser>(`/api/v1/users/${encodeURIComponent(clerkId)}`);
    log.info('core.user_profile.fetched', { clerkId, hasData: !!result });
    return result;
  } catch (error) {
    const meta =
      error instanceof CoreApiError
        ? { clerkId, code: error.code, status: error.status, errorMessage: error.message }
        : { clerkId, errorMessage: error instanceof Error ? error.message : 'unknown' };
    log.warn('core.user_profile.fetch.failed', meta);
    return null;
  }
}

export async function fetchCoreUserMe(coreJwt: string): Promise<CoreUserProfile | null> {
  log.info('core.user_me.fetch');

  try {
    const result = await coreFetch<CoreUserProfile>('/api/v1/users/me', {
      bearerToken: coreJwt,
    });
    log.info('core.user_me.fetched', { hasData: !!result });
    return result;
  } catch (error) {
    log.warn('core.user_me.fetch.failed', {
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
    return null;
  }
}
