import { getCoreApiUrl } from './config';
import type { CoreErrorBody } from './types';

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

export async function coreFetch<T>(
  path: string,
  options: CoreFetchOptions = {},
): Promise<T> {
  const baseUrl = getCoreApiUrl();
  if (!baseUrl) {
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

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

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
      throw new CoreApiError(
        err?.error?.code ?? 'CORE_HTTP_ERROR',
        err?.error?.message ?? `Core API ${response.status}`,
        response.status,
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof CoreApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new CoreApiError('CORE_TIMEOUT', 'Core API request timed out', 504);
    }
    throw new CoreApiError(
      'CORE_NETWORK_ERROR',
      error instanceof Error ? error.message : 'Core API request failed',
      503,
    );
  } finally {
    clearTimeout(timer);
  }
}
