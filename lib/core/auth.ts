import { coreFetch, CoreApiError } from './client';
import { CORE_APPLICATION_PORTAL, isCoreApiConfigured } from './config';
import { logger } from '@/lib/logger';
import type { CoreTokenResponse } from './types';

/** Exchange Clerk session JWT for Jepangku Core JWT. */
export async function exchangeClerkToken(clerkSessionToken: string): Promise<CoreTokenResponse> {
  if (!isCoreApiConfigured()) {
    logger.warn('core.auth.exchange.skipped', {
      reason: 'CORE_API_URL not configured — Core service unavailable',
    });
    throw new CoreApiError('CORE_NOT_CONFIGURED', 'Core API URL is not configured', 503);
  }

  try {
    const result = await coreFetch<CoreTokenResponse>('/api/v1/auth/token', {
      method: 'POST',
      bearerToken: clerkSessionToken,
      body: { application: CORE_APPLICATION_PORTAL },
    });

    logger.info('core.auth.exchange.success', {
      hasToken: !!result.token,
      expiresIn: result.expiresIn,
    });

    return result;
  } catch (error) {
    if (error instanceof CoreApiError) {
      logger.warn('core.auth.exchange.failed', {
        code: error.code,
        status: error.status,
        message: error.message,
      });

      // Core down degrade — logged di sini, caller bisa handle sesuai konteks
      if (error.status >= 500) {
        logger.warn('core.auth.degrade', {
          reason: `Core API returned ${error.status}`,
          code: error.code,
          endpoint: '/api/v1/auth/token',
        });
      }
    } else {
      logger.warn('core.auth.exchange.failed', {
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
    throw error;
  }
}
