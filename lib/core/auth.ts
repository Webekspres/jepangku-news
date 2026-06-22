import { coreFetch } from './client';
import { CORE_APPLICATION_PORTAL } from './config';
import type { CoreTokenResponse } from './types';

/** Exchange Clerk session JWT for Jepangku Core JWT. */
export async function exchangeClerkToken(clerkSessionToken: string): Promise<CoreTokenResponse> {
  return coreFetch<CoreTokenResponse>('/api/v1/auth/token', {
    method: 'POST',
    bearerToken: clerkSessionToken,
    body: { application: CORE_APPLICATION_PORTAL },
  });
}
