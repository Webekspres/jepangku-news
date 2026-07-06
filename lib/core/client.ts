import { getCoreApiUrl } from './config';
import type { CoreErrorBody } from './types';
import { logger } from '@/lib/logger';

export class CoreApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'CoreApiError';
    this.code = code;
    this.status = status;
  }
}

type CoreFetchOptions = {
  method?: 'GET' | 'POST';
  bearerToken?: string | null;
  body?: unknown;
  timeoutMs?: number;
};

const log = logger.child({ module: 'core.client' });

export async function coreFetch<T>(
  path: string,
  options: CoreFetchOptions = {},
): Promise<T> {
  const baseUrl = getCoreApiUrl();
  if (!baseUrl) {
    log.warn('core.client.skipped', { reason: 'CORE_API_URL not set', path });
    throw new CoreApiError('CORE_NOT_CONFIGURED', 'CORE_API_URL is not set', 503);
  }

  const { method = 'GET', bearerToken, body, timeoutMs = 10_000 } = options;
  const url = `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const durationMs = Date.now() - start;
    const text = await response.text();
    let payload: unknown = null;
    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      const err = payload as CoreErrorBody | null;
      log.warn('core.client.http_error', {
        path,
        method,
        status: response.status,
        durationMs,
        code: err?.error?.code ?? 'CORE_HTTP_ERROR',
      });
      throw new CoreApiError(
        err?.error?.code ?? 'CORE_HTTP_ERROR',
        err?.error?.message ?? `Core API ${response.status}`,
        response.status,
      );
    }

    log.info('core.client.ok', {
      path,
      method,
      status: response.status,
      durationMs,
    });

    return payload as T;
  } catch (error) {
    const durationMs = Date.now() - start;

    if (error instanceof CoreApiError) {
      // Already logged above for HTTP errors; timeout/network get logged here
      if (error.code === 'CORE_TIMEOUT') {
        log.warn('core.client.timeout', { path, method, durationMs, timeoutMs });
      } else if (error.code === 'CORE_NETWORK_ERROR') {
        log.warn('core.client.network_error', { path, method, durationMs, errorMessage: error.message });
      }
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      log.warn('core.client.timeout', { path, method, durationMs, timeoutMs });
      throw new CoreApiError('CORE_TIMEOUT', 'Core API request timed out', 504);
    }

    log.warn('core.client.network_error', {
      path,
      method,
      durationMs,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });

    throw new CoreApiError(
      'CORE_NETWORK_ERROR',
      error instanceof Error ? error.message : 'Core API request failed',
      503,
    );
  } finally {
    clearTimeout(timer);
  }
}
