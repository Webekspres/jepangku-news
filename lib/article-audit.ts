import { ArticleStatus, Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import {
  adminArticleHref,
  recordAuditLogSafe,
} from '@/lib/audit-log';
import { formatArticleStatusChange } from '@/lib/audit-log-labels';
import { dispatchNotificationEventSafe } from '@/lib/notifications/dispatch';

type ArticleSnapshot = {
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  categoryId: string | null;
  status: ArticleStatus;
};

const CONTENT_FIELDS = ['title', 'excerpt', 'content', 'coverImageUrl', 'categoryId'] as const;

function articleStatusAction(
  previousStatus: ArticleStatus,
  newStatus: ArticleStatus,
): string {
  if (newStatus === 'PUBLISHED' && previousStatus === 'PENDING_REVIEW') {
    return 'approve';
  }
  if (newStatus === 'REJECTED') return 'reject';
  if (newStatus === 'ARCHIVED') return 'archive';
  return 'status_change';
}

async function getArticleAuditContext(articleId: string) {
  return db.article.findUnique({
    where: { id: articleId },
    select: { id: true, title: true, slug: true },
  });
}

export function hasContentChanges(
  before: ArticleSnapshot,
  after: Partial<ArticleSnapshot>,
): boolean {
  return CONTENT_FIELDS.some((field) => {
    if (after[field] === undefined) return false;
    return after[field] !== before[field];
  });
}

export async function recordStatusReview(params: {
  articleId: string;
  reviewerId: string;
  previousStatus: ArticleStatus;
  newStatus: ArticleStatus;
  note?: string | null;
}) {
  if (params.previousStatus === params.newStatus) return;

  const review = await db.articleReview.create({
    data: {
      articleId: params.articleId,
      reviewerId: params.reviewerId,
      previousStatus: params.previousStatus,
      newStatus: params.newStatus,
      note: params.note?.trim() || null,
      reviewedAt: new Date(),
    },
  });

  const article = await getArticleAuditContext(params.articleId);
  const reviewer = await db.user.findUnique({
    where: { id: params.reviewerId },
    select: { role: true },
  });

  recordAuditLogSafe({
    id: review.id,
    category: 'article',
    action: articleStatusAction(params.previousStatus, params.newStatus),
    actorId: params.reviewerId,
    actorRole: reviewer?.role ?? null,
    targetType: 'article',
    targetId: params.articleId,
    targetLabel: article?.title ?? null,
    targetHref: adminArticleHref(params.articleId),
    summary: formatArticleStatusChange(params.previousStatus, params.newStatus),
    note: params.note?.trim() || null,
    metadata: {
      previousStatus: params.previousStatus,
      newStatus: params.newStatus,
    },
    occurredAt: review.reviewedAt,
  });

  dispatchNotificationEventSafe({
    type: 'article.status_changed',
    articleId: params.articleId,
    reviewerId: params.reviewerId,
    previousStatus: params.previousStatus,
    newStatus: params.newStatus,
    note: params.note,
  });
}

export async function setLastEditor(articleId: string, editorId: string) {
  await db.article.update({
    where: { id: articleId },
    data: {
      lastEditedById: editorId,
      lastEditedAt: new Date(),
    },
  });
}

export async function getNextRevisionNumber(articleId: string): Promise<number> {
  const latest = await db.articleRevision.findFirst({
    where: { articleId },
    orderBy: { revisionNumber: 'desc' },
    select: { revisionNumber: true },
  });
  return (latest?.revisionNumber ?? 0) + 1;
}

export async function recordContentRevision(params: {
  articleId: string;
  editorId: string;
  changeNote: string | null | undefined;
  snapshot: ArticleSnapshot;
  defaultNote?: string;
}) {
  const note = params.changeNote?.trim() || params.defaultNote || null;
  const revisionNumber = await getNextRevisionNumber(params.articleId);

  await db.articleRevision.create({
    data: {
      articleId: params.articleId,
      revisionNumber,
      editorId: params.editorId,
      changeNote: note,
      title: params.snapshot.title,
      excerpt: params.snapshot.excerpt,
      content: params.snapshot.content,
      coverImageUrl: params.snapshot.coverImageUrl,
      categoryId: params.snapshot.categoryId,
      status: params.snapshot.status,
    },
  });

  await setLastEditor(params.articleId, params.editorId);

  const article = await getArticleAuditContext(params.articleId);
  const editor = await db.user.findUnique({
    where: { id: params.editorId },
    select: { role: true },
  });

  recordAuditLogSafe({
    category: 'article',
    action: 'content_revision',
    actorId: params.editorId,
    actorRole: editor?.role ?? null,
    targetType: 'article',
    targetId: params.articleId,
    targetLabel: article?.title ?? params.snapshot.title,
    targetHref: adminArticleHref(params.articleId),
    note: note,
    metadata: {
      revisionNumber,
      status: params.snapshot.status,
    },
  });
}

export async function applyArticleUpdateWithAudit(params: {
  articleId: string;
  editorId: string;
  editorRole: 'ADMIN' | 'USER';
  before: ArticleSnapshot;
  updateData: Prisma.ArticleUncheckedUpdateInput;
  changeNote?: string | null;
  tags?: string[];
  syncTags?: (articleId: string, tags: string[]) => Promise<void>;
}) {
  const { articleId, editorId, editorRole, before, updateData, changeNote, tags, syncTags } =
    params;

  const contentPatch: Partial<ArticleSnapshot> = {};
  if (updateData.title !== undefined) contentPatch.title = updateData.title as string;
  if (updateData.excerpt !== undefined) contentPatch.excerpt = updateData.excerpt as string | null;
  if (updateData.content !== undefined) contentPatch.content = updateData.content as string;
  if (updateData.coverImageUrl !== undefined) {
    contentPatch.coverImageUrl = updateData.coverImageUrl as string | null;
  }
  if (updateData.categoryId !== undefined) {
    contentPatch.categoryId = updateData.categoryId as string | null;
  }

  const newStatus =
    updateData.status !== undefined ? (updateData.status as ArticleStatus) : before.status;
  const contentChanged = hasContentChanges(before, contentPatch);
  const tagsChanged = tags !== undefined;
  const statusChanged = newStatus !== before.status;

  // Catatan perubahan hanya wajib untuk artikel yang sudah keluar dari draft
  // (audit trail konten yang pernah direview/terbit). Draft bebas diedit.
  const changeNoteRequired = before.status !== 'DRAFT';
  if (
    editorRole === 'ADMIN' &&
    changeNoteRequired &&
    (contentChanged || tagsChanged) &&
    !changeNote?.trim()
  ) {
    throw new Error('Catatan perubahan wajib diisi saat admin mengedit konten artikel');
  }

  const updated = await db.article.update({
    where: { id: articleId },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
  });

  if (tags !== undefined && syncTags) {
    await syncTags(articleId, tags);
  }

  if (contentChanged || tagsChanged) {
    await recordContentRevision({
      articleId,
      editorId,
      changeNote,
      snapshot: {
        title: updated.title,
        excerpt: updated.excerpt,
        content: updated.content,
        coverImageUrl: updated.coverImageUrl,
        categoryId: updated.categoryId,
        status: updated.status,
      },
      defaultNote:
        editorRole === 'USER' ? 'Diedit oleh penulis' : undefined,
    });
  } else if (statusChanged || Object.keys(updateData).length > 0) {
    await setLastEditor(articleId, editorId);
  }

  if (statusChanged) {
    await recordStatusReview({
      articleId,
      reviewerId: editorId,
      previousStatus: before.status,
      newStatus: updated.status,
      note:
        changeNote?.trim() ||
        (editorRole === 'ADMIN' ? 'Perubahan status oleh admin' : 'Perubahan status oleh penulis'),
    });
  }

  return updated;
}

export const revisionListSelect = {
  id: true,
  revisionNumber: true,
  changeNote: true,
  title: true,
  status: true,
  createdAt: true,
  editor: { select: { id: true, name: true, role: true } },
} as const;

export const revisionDetailSelect = {
  id: true,
  revisionNumber: true,
  changeNote: true,
  title: true,
  excerpt: true,
  content: true,
  coverImageUrl: true,
  categoryId: true,
  status: true,
  createdAt: true,
  editor: { select: { id: true, name: true, role: true } },
} as const;

export const reviewListSelect = {
  id: true,
  previousStatus: true,
  newStatus: true,
  note: true,
  reviewedAt: true,
  reviewer: { select: { id: true, name: true, role: true } },
} as const;
