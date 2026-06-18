import { Resend } from 'resend';
import {
  getEmailFromHeader,
  getEmailReplyTo,
  getResendApiKey,
} from '@/lib/email/config';

let client: Resend | null = null;

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
    throw new Error('EMAIL_NOT_CONFIGURED');
  }

  const replyTo = getEmailReplyTo();
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    throw new Error(error.message);
  }
}
