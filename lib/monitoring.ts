import { logger } from './logger';

// ─── Configuration ───────────────────────────────────────────────

const monitoringEndpoint = process.env.MONITORING_WEBHOOK_URL;

const MAX_BREADCRUMBS = 50;
const breadcrumbs: BreadcrumbEntry[] = [];

// ─── Types ───────────────────────────────────────────────────────

export type BreadcrumbEntry = {
  event: string;
  data?: Record<string, unknown>;
  timestamp: string;
};

export type ErrorFingerprint = {
  name: string;
  message: string;
  fingerprint: string;
};

// ─── 5.1 Breadcrumbs System ──────────────────────────────────────

/**
 * Track an action before an error occurs (in-memory ring buffer, max 50).
 *
 * Example:
 *   addBreadcrumb('user.login', { userId });
 *   addBreadcrumb('api.call', { endpoint: '/articles', method: 'GET' });
 */
export function addBreadcrumb(event: string, data?: Record<string, unknown>): void {
  breadcrumbs.push({
    event,
    data,
    timestamp: new Date().toISOString(),
  });

  // Keep ring buffer at max capacity
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }
}

/** Return a copy of the current breadcrumbs (for attaching to error payloads). */
export function getBreadcrumbs(): BreadcrumbEntry[] {
  return [...breadcrumbs];
}

/** Clear all breadcrumbs (e.g. after a fatal error is reported). */
export function clearBreadcrumbs(): void {
  breadcrumbs.length = 0;
}

// ─── 5.2 Error Fingerprint ───────────────────────────────────────

/**
 * Compute an error fingerprint based on `name + message`.
 * This allows grouping identical errors across occurrences.
 */
export function computeErrorFingerprint(error: unknown): ErrorFingerprint {
  const name = error instanceof Error ? error.name : 'UnknownError';
  const message = error instanceof Error ? error.message : String(error);
  // Normalize: trim whitespace, collapse repeating whitespace, lowercase
  const normalized = `${name}:${message}`
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  // Use a simple hash for the fingerprint string
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const fingerprint = `err_${Math.abs(hash).toString(16).padStart(8, '0')}`;

  return { name, message, fingerprint };
}

// ─── 5.4 Error Boundary Helpers ──────────────────────────────────

type ExceptionPayload = {
  type: string;
  timestamp: string;
  error: string;
  name: string;
  stack?: string;
  fingerprint: string;
  digest?: string;
  breadcrumbs: BreadcrumbEntry[];
  context?: Record<string, unknown>;
};

function buildExceptionPayload(
  error: unknown,
  context?: Record<string, unknown>,
): ExceptionPayload {
  const fp = computeErrorFingerprint(error);
  const digest = error instanceof Error && 'digest' in error
    ? (error as Error & { digest?: string }).digest
    : undefined;

  return {
    type: 'exception',
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
    name: fp.name,
    stack: error instanceof Error ? error.stack : undefined,
    fingerprint: fp.fingerprint,
    digest,
    breadcrumbs: getBreadcrumbs(),
    context,
  };
}

// ─── Public API ──────────────────────────────────────────────────

export function isMonitoringEnabled() {
  return Boolean(monitoringEndpoint);
}

export async function captureException(error: unknown, context?: Record<string, unknown>) {
  const payload = buildExceptionPayload(error, context);

  logger.error('Captured exception', payload);

  // Always clear breadcrumbs after logging (snapshot already captured in payload)
  clearBreadcrumbs();

  if (!monitoringEndpoint) {
    return;
  }

  try {
    await fetch(monitoringEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
  } catch (sendError) {
    logger.warn('Failed to send monitoring payload', {
      sendError: sendError instanceof Error ? sendError.message : String(sendError),
      endpoint: monitoringEndpoint,
    });
  }
}

export function captureMessage(message: string, context?: Record<string, unknown>) {
  logger.info(message, { context });
}
