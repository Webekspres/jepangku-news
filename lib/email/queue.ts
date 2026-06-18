import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getEmailQueueSecret, getQstashToken, isEmailConfigured } from '@/lib/email/config';
import { renderEmailTemplate } from '@/lib/email/templates';
import { sendTransactionalEmail } from '@/lib/email/transport';
import type { EmailTemplateId, QueueEmailInput } from '@/lib/email/types';
import { logger } from '@/lib/logger';
import { getSiteUrl } from '@/lib/site-url';

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
  );
}

async function scheduleOutboxProcessing(outboxId: string): Promise<void> {
  const token = getQstashToken();
  const secret = getEmailQueueSecret();
  const processUrl = `${getSiteUrl()}/api/internal/email/process`;

  if (token) {
    try {
      const res = await fetch(
        `https://qstash.upstash.io/v2/publish/${encodeURIComponent(processUrl)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(secret ? { 'Upstash-Forward-Authorization': `Bearer ${secret}` } : {}),
          },
          body: JSON.stringify({ outboxId }),
        },
      );
      if (!res.ok) {
        throw new Error(`QStash publish failed: ${res.status}`);
      }
      return;
    } catch (error) {
      logger.warn('email.queue.qstash_failed', {
        outboxId,
        errorMessage: error instanceof Error ? error.message : 'unknown',
      });
    }
  }

  processEmailOutboxSafe(outboxId);
}

export async function queueEmail<T extends EmailTemplateId>(
  input: QueueEmailInput<T>,
): Promise<{ queued: boolean; outboxId: string | null; deduped?: boolean }> {
  try {
    const row = await db.emailOutbox.create({
      data: {
        userId: input.userId,
        template: input.template,
        toEmail: input.toEmail,
        subject: input.subject,
        payload: input.payload as Prisma.InputJsonValue,
        dedupeKey: input.dedupeKey ?? null,
        status: 'PENDING',
      },
      select: { id: true },
    });

    logger.info('email.queue.enqueued', {
      outboxId: row.id,
      userId: input.userId,
      template: input.template,
    });

    await scheduleOutboxProcessing(row.id);
    return { queued: true, outboxId: row.id };
  } catch (error) {
    if (isUniqueViolation(error) && input.dedupeKey) {
      logger.info('email.queue.deduped', {
        userId: input.userId,
        template: input.template,
        dedupeKey: input.dedupeKey,
      });
      return { queued: false, outboxId: null, deduped: true };
    }
    logger.warn('email.queue.failed', {
      userId: input.userId,
      template: input.template,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
    return { queued: false, outboxId: null };
  }
}

export function queueEmailSafe<T extends EmailTemplateId>(input: QueueEmailInput<T>): void {
  void queueEmail(input).catch((error) => {
    logger.warn('email.queue.failed', {
      userId: input.userId,
      template: input.template,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
  });
}

export async function processEmailOutbox(outboxId: string): Promise<void> {
  const row = await db.emailOutbox.findUnique({ where: { id: outboxId } });
  if (!row || row.status === 'SENT' || row.status === 'SKIPPED') return;

  await db.emailOutbox.update({
    where: { id: outboxId },
    data: {
      status: 'PROCESSING',
      attempts: { increment: 1 },
    },
  });

  if (!isEmailConfigured()) {
    await db.emailOutbox.update({
      where: { id: outboxId },
      data: {
        status: 'SKIPPED',
        lastError: 'EMAIL_NOT_CONFIGURED',
        sentAt: null,
      },
    });
    logger.info('email.send.skipped', { outboxId, reason: 'EMAIL_NOT_CONFIGURED' });
    return;
  }

  try {
    const rendered = renderEmailTemplate(
      row.template as EmailTemplateId,
      row.payload as never,
    );

    await sendTransactionalEmail({
      to: row.toEmail,
      subject: rendered.subject || row.subject,
      html: rendered.html,
      text: rendered.text,
    });

    await db.emailOutbox.update({
      where: { id: outboxId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        lastError: null,
      },
    });

    logger.info('email.send.ok', { outboxId, template: row.template });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    await db.emailOutbox.update({
      where: { id: outboxId },
      data: {
        status: 'FAILED',
        lastError: message,
      },
    });
    logger.warn('email.send.failed', { outboxId, errorMessage: message });
    throw error;
  }
}

export function processEmailOutboxSafe(outboxId: string): void {
  void processEmailOutbox(outboxId).catch(() => {
    // logged in processEmailOutbox
  });
}
