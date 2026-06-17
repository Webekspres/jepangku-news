export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_FROM?.trim(),
  );
}

export function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.SMTP_FROM?.trim();
  if (!host || !from) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();

  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
    from,
  };
}

export function getEmailQueueSecret(): string | null {
  return process.env.EMAIL_QUEUE_SECRET?.trim() || null;
}

export function getQstashToken(): string | null {
  return process.env.QSTASH_TOKEN?.trim() || null;
}
