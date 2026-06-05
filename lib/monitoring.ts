import { logger } from './logger';

const monitoringEndpoint = process.env.MONITORING_WEBHOOK_URL;

export async function captureException(error: unknown, context?: Record<string, unknown>) {
  const payload = {
    type: 'exception',
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
  };

  logger.error('Captured exception', payload);

  if (!monitoringEndpoint) {
    return;
  }

  try {
    await fetch(monitoringEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
