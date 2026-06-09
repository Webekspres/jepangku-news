export {
  getCoreApiUrl,
  getCoreServiceToken,
  isCoreApiConfigured,
  isCoreAwardConfigured,
  CORE_APPLICATION_PORTAL,
} from './config';

export { CoreApiError, coreFetch } from './client';
export { exchangeClerkToken } from './auth';
export { awardXp } from './gamification';
export {
  CORE_SESSION_COOKIE,
  coreSessionCookieOptions,
  decodeCoreJwtClaims,
  establishCoreSession,
  getCoreJwtClaims,
  getCoreSessionToken,
  refreshCoreSession,
  refreshCurrentUserCoreSession,
} from './session';
export {
  fetchCoreLeaderboard,
  fetchCoreUserMe,
  fetchCoreUserProfile,
} from './users';
export {
  PORTAL_TO_CORE_ACTIVITY,
  toCoreActivityType,
  buildNewsIdempotencyKey,
} from './activity-map';

export type { CoreJwtClaims } from './session';
export type {
  CoreAwardXpInput,
  CoreAwardXpResponse,
  CoreErrorBody,
  CoreHealthResponse,
  CoreTokenResponse,
  CoreLeaderboardResponse,
  CorePublicUser,
  CoreUserProfile,
} from './types';
