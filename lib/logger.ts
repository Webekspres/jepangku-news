/**
 * Core logger — Pino
 *
 * API backward-compatible dengan logger sebelumnya:
 *   logger.info('message', { meta })
 *   logger.warn('message', { meta })
 *   logger.error('message', { meta })
 *   logger.child({ module: 'auth' })  → child logger dengan konteks tetap
 *
 * Output:
 *   Development: pretty-print via pino-pretty (colorized, readable)
 *   Production:  JSON murni ke stdout → ditangkap Promtail → Loki
 *
 * Redact field sensitif: password, token, secret, authorization, cookie
 * Warn/error: juga dikirim ke log drain (webhook eksternal)
 */

import os from 'os';
import pino from 'pino';
import { forwardLogDrain } from './log-drain';

// ─── Pino Instance ───────────────────────────────────────────────

const level = process.env.LOG_LEVEL || 'info';
const isDev = process.env.NODE_ENV !== 'production';

// Identitas service: dipakai Promtail untuk membuat label `service` di Loki
// (dashboard Grafana memfilter berdasarkan label ini). Bisa dioverride via env
// bila image yang sama dipakai untuk service lain.
const serviceName = process.env.LOG_SERVICE_NAME || 'jepangku-news';

const pinoLogger = pino({
  level,

  // Base bindings ikut di setiap baris log stdout (JSON) → Promtail → Loki.
  base: { service: serviceName, pid: process.pid, hostname: os.hostname() },

  // Emit level sebagai string ("info"/"warn"/"error"), bukan angka Pino
  // (30/40/50). Dashboard & alert Grafana memfilter `level="error"`.
  formatters: {
    level(label) {
      return { level: label };
    },
  },

  redact: {
    paths: [
      'password',
      'token',
      'secret',
      'authorization',
      'cookie',
      'req.headers.cookie',
      'req.headers.authorization',
    ],
    censor: '[REDACTED]',
  },

  // Pretty-print hanya di development
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});

// ─── Types ───────────────────────────────────────────────────────

type LogMeta = Record<string, unknown>;

// ─── Helper: emit ke Pino + drain ────────────────────────────────

function emit(
  pinoInstance: pino.Logger,
  level: 'info' | 'warn' | 'error',
  message: string,
  meta?: LogMeta,
) {
  if (meta && Object.keys(meta).length > 0) {
    pinoInstance[level](meta, message);
  } else {
    pinoInstance[level](message);
  }

  // Forward warn/error ke log drain (webhook eksternal)
  if (level === 'warn' || level === 'error') {
    forwardLogDrain({
      timestamp: new Date().toISOString(),
      level,
      message,
      service: 'jepangku-news',
      environment: process.env.NODE_ENV ?? 'development',
      ...(meta || {}),
    });
  }
}

// ─── Public API ──────────────────────────────────────────────────

export const logger = {
  info(message: string, meta?: LogMeta) {
    emit(pinoLogger, 'info', message, meta);
  },

  warn(message: string, meta?: LogMeta) {
    emit(pinoLogger, 'warn', message, meta);
  },

  error(message: string, meta?: LogMeta) {
    emit(pinoLogger, 'error', message, meta);
  },

  /**
   * Buat child logger dengan bindings tetap (misal module name).
   *
   * Contoh:
   *   const log = logger.child({ module: 'auth' });
   *   log.warn('login.failed', { userId }); // otomatis sertakan { module: 'auth' }
   */
  child(bindings: Record<string, unknown>) {
    const childPino = pinoLogger.child(bindings);

    return {
      info(message: string, meta?: LogMeta) {
        emit(childPino, 'info', message, meta);
      },
      warn(message: string, meta?: LogMeta) {
        emit(childPino, 'warn', message, meta);
      },
      error(message: string, meta?: LogMeta) {
        emit(childPino, 'error', message, meta);
      },
    };
  },
};
