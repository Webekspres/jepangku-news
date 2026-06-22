import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { isEmailConfigured, shouldPublishEmailViaQstash } from '@/lib/email/config';
import { getEmailProcessHeaders, getQstashClient } from '@/lib/email/qstash';
import { renderEmailTemplate, EmailTemplateDisabledError } from '@/lib/email/templates';
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
  const processUrl = `${getSiteUrl()}/api/internal/email/process`;
  const client = getQstashClient();

  if (client && shouldPublishEmailViaQstash()) {
    try {
      const headers = getEmailProcessHeaders();
      await client.publishJSON({
        url: processUrl,
        body: { outboxId },
        ...(headers ? { headers } : {}),
      });
      logger.info('email.queue.qstash_scheduled', { outboxId, processUrl });
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
    const rendered = await renderEmailTemplate(
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
    if (error instanceof EmailTemplateDisabledError) {
      await db.emailOutbox.update({
        where: { id: outboxId },
        data: {
          status: 'SKIPPED',
          lastError: error.message,
          sentAt: null,
        },
      });
      logger.info('email.send.skipped', { outboxId, reason: error.message });
      return;
    }

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
