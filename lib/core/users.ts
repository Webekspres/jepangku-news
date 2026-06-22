import { logger } from '@/lib/logger';
import { coreFetch, CoreApiError } from './client';
import type { CoreLeaderboardResponse, CorePublicUser, CoreUserProfile } from './types';

export async function fetchCoreLeaderboard(limit = 10, offset = 0): Promise<CoreLeaderboardResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return coreFetch<CoreLeaderboardResponse>(`/api/v1/leaderboard?${params}`);
}

export async function fetchCoreUserProfile(clerkId: string): Promise<CorePublicUser | null> {
  try {
    return await coreFetch<CorePublicUser>(`/api/v1/users/${encodeURIComponent(clerkId)}`);
  } catch (error) {
    const meta =
      error instanceof CoreApiError
        ? { clerkId, code: error.code, status: error.status, errorMessage: error.message }
        : { clerkId, errorMessage: error instanceof Error ? error.message : 'unknown' };
    logger.warn('core.user_profile.fetch.failed', meta);
    return null;
  }
}

export async function fetchCoreUserMe(coreJwt: string): Promise<CoreUserProfile | null> {
  try {
    return await coreFetch<CoreUserProfile>('/api/v1/users/me', {
      bearerToken: coreJwt,
    });
  } catch {
    return null;
  }
}
