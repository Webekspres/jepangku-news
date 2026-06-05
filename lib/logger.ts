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

export const logger = {
  info(message: string, meta?: LoggerMetadata) {
    console.log(formatRecord('info', message, meta));
  },
  warn(message: string, meta?: LoggerMetadata) {
    console.warn(formatRecord('warn', message, meta));
  },
  error(message: string, meta?: LoggerMetadata) {
    console.error(formatRecord('error', message, meta));
  },
};
