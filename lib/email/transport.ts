import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { getSmtpConfig } from '@/lib/email/config';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const config = getSmtpConfig();
  if (!config) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
  }
  return transporter;
}

export async function sendSmtpEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const config = getSmtpConfig();
  const transport = getTransporter();
  if (!config || !transport) {
    throw new Error('SMTP_NOT_CONFIGURED');
  }

  await transport.sendMail({
    from: config.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}
