import { Resend } from 'resend';
import {
  getEmailFromHeader,
  getEmailReplyTo,
  getResendApiKey,
} from '@/lib/email/config';
import { logger } from '@/lib/logger';

let client: Resend | null = null;
const log = logger.child({ module: 'email.transport' });

function getResendClient(): Resend | null {
  const apiKey = getResendApiKey();
  if (!apiKey) return null;
  if (!client) {
    client = new Resend(apiKey);
  }
  return client;
}

export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const resend = getResendClient();
  const from = getEmailFromHeader();
  if (!resend || !from) {
    log.warn('email.send.skipped', { reason: 'EMAIL_NOT_CONFIGURED', to: params.to, subject: params.subject });
    throw new Error('EMAIL_NOT_CONFIGURED');
  }

  const start = Date.now();
  const replyTo = getEmailReplyTo();

  log.info('email.send.start', {
    to: params.to,
    subject: params.subject,
    htmlSize: params.html.length,
    textSize: params.text.length,
  });

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      log.warn('email.send.failed', {
        to: params.to,
        subject: params.subject,
        durationMs: Date.now() - start,
        errorMessage: error.message,
      });
      throw new Error(error.message);
    }

    log.info('email.send.ok', {
      to: params.to,
      subject: params.subject,
      durationMs: Date.now() - start,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_NOT_CONFIGURED') throw error;
    log.warn('email.send.error', {
      to: params.to,
      subject: params.subject,
      durationMs: Date.now() - start,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
    throw error;
  }
}
