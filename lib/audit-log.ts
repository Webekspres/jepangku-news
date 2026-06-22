import type { Prisma, Role } from '@prisma/client';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getAuditActionLabel } from '@/lib/audit-log-labels';

export type AuditLogInput = {
  category: string;
  action: string;
  actorId?: string | null;
  actorRole?: Role | null;
  targetType?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
  targetHref?: string | null;
  summary?: string | null;
  note?: string | null;
  metadata?: Prisma.InputJsonValue | null;
  occurredAt?: Date;
  id?: string;
};

export async function recordAuditLog(input: AuditLogInput): Promise<void> {
  const summary =
    input.summary?.trim() ||
    getAuditActionLabel(input.category, input.action);

  await db.auditLog.create({
    data: {
      ...(input.id ? { id: input.id } : {}),
      category: input.category,
      action: input.action,
      actorId: input.actorId ?? null,
      actorRole: input.actorRole ?? null,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      targetLabel: input.targetLabel ?? null,
      targetHref: input.targetHref ?? null,
      summary,
      note: input.note?.trim() || null,
      metadata: input.metadata ?? undefined,
      occurredAt: input.occurredAt ?? new Date(),
    },
  });
}

/** Non-blocking audit write — failures are logged, never thrown to callers. */
export function recordAuditLogSafe(input: AuditLogInput): void {
  void recordAuditLog(input).catch((error) => {
    logger.warn('audit_log.write_failed', {
      category: input.category,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

export function adminArticleHref(articleId: string): string {
  return `/admin/articles/${articleId}`;
}

export function publicArticleHref(slug: string): string {
  return `/articles/${slug}`;
}
