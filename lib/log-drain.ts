type DrainPayload = {
  timestamp: string;
  level: 'warn' | 'error';
  message: string;
  service: string;
  environment: string;
  [key: string]: unknown;
};

const drainUrl = process.env.LOG_DRAIN_URL;
const serviceName = process.env.LOG_SERVICE_NAME ?? 'jepangku-news';

/** Fire-and-forget forward for warn/error — Vercel Log Drain compatible JSON. */
export function forwardLogDrain(payload: DrainPayload) {
  if (!drainUrl) return;

  const body = JSON.stringify({
    ...payload,
    service: serviceName,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
  });

  void fetch(drainUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    signal: AbortSignal.timeout(3000),
  }).catch(() => {
    // Never block or recurse into logger on drain failure
  });
}

export function isLogDrainEnabled() {
  return Boolean(drainUrl);
}
