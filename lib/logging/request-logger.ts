/**
 * Request Logger — Mencatat setiap HTTP request yang masuk
 *
 * Phase 2 — Request Logging Middleware
 *
 * Fitur:
 * - method, path, status, durationMs
 * - userId (jika terautentikasi)
 * - reqId (correlation ID — trace dari request ke response)
 * - userAgent, ip (anonymized — hanya 2 oktet terakhir)
 *
 * Integrasi:
 * - proxy.ts (Clerk middleware) → log request dasar tanpa body
 * - withRequestLogging wrapper → log lengkap dengan response status & duration
 */

import { logger } from '@/lib/logger';
import { apiError } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { type NextRequest } from 'next/server';

// ─── Types ───────────────────────────────────────────────────────

export type RequestLogEntry = {
  reqId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  userId?: string | null;
  userAgent?: string;
  ip?: string;
  error?: string;
};

// ─── Helpers ─────────────────────────────────────────────────────

/** Generate unique request ID (correlation ID) */
export function generateReqId(): string {
  return crypto.randomUUID();
}

/** Anonymize IP — hanya tampilkan 2 oktet terakhir (xxx.xxx.1.234) */
export function anonymizeIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `xxx.xxx.${parts[2]}.${parts[3]}`;
  }
  // IPv6 atau unknown — masked
  return '[masked]';
}

/** Extract client IP dari request headers */
export function getClientIp(request: Request | NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

/** Extract user-agent */
export function getUserAgent(request: Request | NextRequest): string {
  return request.headers.get('user-agent') ?? '';
}

// ─── Core Logging ────────────────────────────────────────────────

const log = logger.child({ module: 'http' });

/**
 * Log request sederhana (tanpa await auth) — dipanggil dari proxy.ts
 * Tidak menunggu resolve user karena di middleware tidak bisa await auth
 */
export function logRequestStart(entry: {
  reqId: string;
  method: string;
  path: string;
  ip?: string;
  userAgent?: string;
}): void {
  log.info('request.start', {
    reqId: entry.reqId,
    method: entry.method,
    path: entry.path,
    ip: entry.ip ? anonymizeIp(entry.ip) : undefined,
    userAgent: entry.userAgent,
  });
}

/**
 * Log request lengkap dengan response status, duration, dan userId
 * Dipanggil dari withRequestLogging wrapper di route handler
 */
export async function logRequestComplete(
  request: Request | NextRequest,
  entry: {
    reqId: string;
    method: string;
    path: string;
    status: number;
    durationMs: number;
    error?: string;
  },
): Promise<void> {
  // Ambil userId — non-blocking, boleh null
  let userId: string | null | undefined;
  try {
    const user = await getCurrentUser(request as any);
    userId = user?.id;
  } catch {
    userId = undefined;
  }

  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  // Pilih level log berdasarkan status
  const statusCode = entry.status;
  const level: 'error' | 'warn' | 'info' =
    statusCode >= 500 ? 'error' :
    statusCode >= 400 ? 'warn' :
    'info';

  const message = entry.error
    ? `request.error ${entry.method} ${entry.path} → ${entry.status} (${entry.durationMs}ms)`
    : `request.complete ${entry.method} ${entry.path} → ${entry.status} (${entry.durationMs}ms)`;

  log[level](message, {
    reqId: entry.reqId,
    method: entry.method,
    path: entry.path,
    status: entry.status,
    durationMs: entry.durationMs,
    userId: userId ?? undefined,
    ip: anonymizeIp(ip),
    userAgent,
    error: entry.error,
  });
}

/**
 * Wrapper untuk API route handler — otomatis mencatat request + response
 *
 * Contoh penggunaan:
 *   import { withRequestLogging } from '@/lib/logging/request-logger';
 *
 *   export const GET = withRequestLogging(async (request, { params }) => {
 *     // ... handler logic ...
 *     return apiSuccess({ data });
 *   });
 */
/**
 * Type helper untuk route handler — NextRequest atau Request.
 * Generic terhadap tipe params agar route dinamis (`[id]`) maupun catch-all
 * (`[...path]` → `{ path: string[] }`) tetap kompatibel dengan tipe Next.js.
 */
type RouteHandler<TParams = Record<string, string>> = (
  request: NextRequest,
  context: { params: Promise<TParams> },
) => Promise<Response>;

export function withRequestLogging<TParams = Record<string, string>>(
  handler: RouteHandler<TParams>,
  options?: { module?: string },
) {
  const log = options?.module
    ? logger.child({ module: options.module })
    : logger.child({ module: 'api' });

  return async (
    request: NextRequest,
    context: { params: Promise<TParams> },
  ): Promise<Response> => {
    // Reuse correlation ID from proxy middleware when available
    const reqId = request.headers.get('x-request-id') ?? generateReqId();
    const start = Date.now();
    const url = new URL(request.url);
    const path = url.pathname + (url.search || '');

    try {
      // proxy.ts already logs request.start — skip duplicate when reqId forwarded
      if (!request.headers.get('x-request-id')) {
        logRequestStart({
          reqId,
          method: request.method,
          path,
          ip: getClientIp(request),
          userAgent: getUserAgent(request),
        });
      }

      // Jalankan handler
      const response = await handler(request, context);
      const durationMs = Date.now() - start;

      // Catat response (fire & forget — tidak perlu await untuk logging)
      logRequestComplete(request, {
        reqId,
        method: request.method,
        path,
        status: response.status,
        durationMs,
      }).catch(() => {});

      // Set correlation ID header
      const cloned = new Response(response.body, response);
      cloned.headers.set('x-request-id', reqId);
      return cloned;

    } catch (error) {
      const durationMs = Date.now() - start;

      logRequestComplete(request, {
        reqId,
        method: request.method,
        path,
        status: 500,
        durationMs,
        error: error instanceof Error ? error.message : String(error),
      }).catch(() => {});

      log.error('request.handler_error', {
        reqId,
        method: request.method,
        path,
        durationMs,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      const message =
        error instanceof Error ? error.message : 'Internal server error';
      const response = apiError(message, { status: 500 });
      response.headers.set('x-request-id', reqId);
      return response;
    }
  };
}
