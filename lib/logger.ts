import { forwardLogDrain } from './log-drain';

type LoggerMetadata = Record<string, unknown>;

type LogRecord = {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
} & LoggerMetadata;

function formatRecord(level: LogRecord['level'], message: string, meta?: LoggerMetadata): string {
  const record: LogRecord = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta || {}),
  };
  return JSON.stringify(record);
}

function emit(level: LogRecord['level'], message: string, meta?: LoggerMetadata) {
  const line = formatRecord(level, message, meta);
  if (level === 'info') console.log(line);
  else if (level === 'warn') console.warn(line);
  else console.error(line);

  if (level === 'warn' || level === 'error') {
    forwardLogDrain({
      timestamp: new Date().toISOString(),
      level,
      message,
      service: 'jepangku-news',
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
      ...(meta || {}),
    });
  }
}

export const logger = {
  info(message: string, meta?: LoggerMetadata) {
    emit('info', message, meta);
  },
  warn(message: string, meta?: LoggerMetadata) {
    emit('warn', message, meta);
  },
  error(message: string, meta?: LoggerMetadata) {
    emit('error', message, meta);
  },
};
