import { getCoreServiceToken } from './config';
import { CoreApiError, coreFetch } from './client';
import type { CoreAwardXpInput, CoreAwardXpResponse } from './types';

/** Award XP/points via Core (server-to-server). Requires CORE_SERVICE_TOKEN. */
export async function awardXp(input: CoreAwardXpInput): Promise<CoreAwardXpResponse> {
  const serviceToken = getCoreServiceToken();
  if (!serviceToken) {
    throw new CoreApiError(
      'CORE_SERVICE_TOKEN_NOT_CONFIGURED',
      'CORE_SERVICE_TOKEN is not set',
      503,
    );
  }

  return coreFetch<CoreAwardXpResponse>('/api/v1/gamification/award', {
    method: 'POST',
    bearerToken: serviceToken,
    body: input,
  });
}
