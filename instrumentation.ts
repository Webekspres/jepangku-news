/**
 * Next.js Instrumentation Hook (instrumentation.ts)
 *
 * Registers global error handlers for uncaught exceptions and unhandled
 * promise rejections at the server-process level.
 *
 * Phase 5.5 — process.on('uncaughtException') — log fatal + exit
 *
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import { logger } from './lib/logger';

export function register(): void {
  // ── Uncaught Exception ──────────────────────────────────────────
  process.on('uncaughtException', (error: Error) => {
    logger.error('process.uncaught_exception', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Exit with failure — the process is in an unknown state
    process.exit(1);
  });

  // ── Unhandled Promise Rejection ─────────────────────────────────
  process.on('unhandledRejection', (reason: unknown) => {
    const error =
      reason instanceof Error
        ? reason
        : new Error(typeof reason === 'string' ? reason : 'Unhandled promise rejection');

    logger.error('process.unhandled_rejection', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Do NOT exit — unhandled rejections may be recoverable in Node.js
  });
}
