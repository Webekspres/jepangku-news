import { coreFetch } from './client';
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
  } catch {
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
