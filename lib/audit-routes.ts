import type { Role, Prisma } from '@prisma/client';
import { recordAuditLogSafe, adminArticleHref } from '@/lib/audit-log';

type Actor = {
  id: string;
  role: Role;
  name?: string;
};

export function auditCommentCreate(
  actor: Actor,
  commentId: string,
  target: { type: string; id: string; title: string },
  isReply: boolean,
) {
  recordAuditLogSafe({
    category: 'comment',
    action: 'create',
    actorId: actor.id,
    actorRole: actor.role,
    targetType: target.type.toLowerCase(),
    targetId: target.id,
    targetLabel: target.title,
    note: isReply ? 'Balasan komentar' : undefined,
    metadata: { commentId, isReply },
  });
}

export function auditCommentUpdate(actor: Actor, commentId: string) {
  recordAuditLogSafe({
    category: 'comment',
    action: 'update',
    actorId: actor.id,
    actorRole: actor.role,
    targetType: 'comment',
    targetId: commentId,
  });
}

export function auditCommentDelete(
  actor: Actor,
  commentId: string,
  asAdmin: boolean,
) {
  recordAuditLogSafe({
    category: 'comment',
    action: 'delete',
    actorId: actor.id,
    actorRole: actor.role,
    targetType: 'comment',
    targetId: commentId,
    metadata: { asAdmin },
  });
}

export function auditCommentModeration(
  actor: Actor,
  commentId: string,
  action: 'hide' | 'unhide' | 'hard_delete',
) {
  recordAuditLogSafe({
    category: 'comment',
    action: action === 'hard_delete' ? 'hard_delete' : 'moderate',
    actorId: actor.id,
    actorRole: actor.role,
    targetType: 'comment',
    targetId: commentId,
    metadata: { moderation: action },
  });
}

export function auditReactionToggle(
  actor: Actor,
  targetType: string,
  targetId: string,
  reactionType: string,
  action: 'created' | 'switched' | 'removed',
) {
  recordAuditLogSafe({
    category: 'reaction',
    action,
    actorId: actor.id,
    actorRole: actor.role,
    targetType: targetType.toLowerCase(),
    targetId,
    metadata: { reactionType },
  });
}

export function auditPollVote(actor: Actor, poll: { id: string; title: string; slug: string }, count: number) {
  recordAuditLogSafe({
    category: 'poll',
    action: 'vote',
    actorId: actor.id,
    actorRole: actor.role,
    targetType: 'poll',
    targetId: poll.id,
    targetLabel: poll.title,
    targetHref: `/polls/${poll.slug}`,
    metadata: { questionsAnswered: count },
  });
}

export function auditQuizAttempt(
  actor: Actor,
  quiz: { id: string; title: string; slug: string },
  score: { correct: number; total: number; points: number },
) {
  recordAuditLogSafe({
    category: 'quiz',
    action: 'attempt_submit',
    actorId: actor.id,
    actorRole: actor.role,
    targetType: 'quiz',
    targetId: quiz.id,
    targetLabel: quiz.title,
    targetHref: `/quizzes/${quiz.slug}`,
    metadata: score,
  });
}

export function auditBookmark(
  actor: Actor,
  action: 'create' | 'delete',
  article: { id: string; title: string },
) {
  recordAuditLogSafe({
    category: 'bookmark',
    action,
    actorId: actor.id,
    actorRole: actor.role,
    targetType: 'article',
    targetId: article.id,
    targetLabel: article.title,
    targetHref: adminArticleHref(article.id),
  });
}

export function auditArticleShare(
  actor: Actor,
  article: { id: string; title: string; slug: string },
  method: string,
) {
  recordAuditLogSafe({
    category: 'article',
    action: 'share',
    actorId: actor.id,
    actorRole: actor.role,
    targetType: 'article',
    targetId: article.id,
    targetLabel: article.title,
    targetHref: `/articles/${article.slug}`,
    metadata: { method },
  });
}

export function auditArticleReadComplete(
  actor: Actor,
  article: { id: string; title: string; slug: string },
) {
  recordAuditLogSafe({
    category: 'article',
    action: 'read_complete',
    actorId: actor.id,
    actorRole: actor.role,
    targetType: 'article',
    targetId: article.id,
    targetLabel: article.title,
    targetHref: `/articles/${article.slug}`,
  });
}

export function auditArticleCreate(
  actor: Actor,
  article: { id: string; title: string; status: string },
  source: 'user' | 'admin',
) {
  recordAuditLogSafe({
    category: 'article',
    action: 'create',
    actorId: actor.id,
    actorRole: actor.role,
    targetType: 'article',
    targetId: article.id,
    targetLabel: article.title,
    targetHref: adminArticleHref(article.id),
    metadata: { status: article.status, source },
  });
}

export function auditArticleDraftUpdate(actor: Actor, article: { id: string; title: string }) {
  recordAuditLogSafe({
    category: 'article',
    action: 'draft_update',
    actorId: actor.id,
    actorRole: actor.role,
    targetType: 'article',
    targetId: article.id,
    targetLabel: article.title,
    targetHref: adminArticleHref(article.id),
  });
}

export function auditArticleDelete(
  actor: Actor,
  article: { id: string; title: string },
  asAdmin: boolean,
) {
  recordAuditLogSafe({
    category: 'article',
    action: 'delete',
    actorId: actor.id,
    actorRole: actor.role,
    targetType: 'article',
    targetId: article.id,
    targetLabel: article.title,
    metadata: { asAdmin },
  });
}

export function auditUserProfileUpdate(actor: Actor) {
  recordAuditLogSafe({
    category: 'user',
    action: 'profile_update',
    actorId: actor.id,
    actorRole: actor.role,
    targetType: 'user',
    targetId: actor.id,
    targetLabel: actor.name ?? actor.id,
    targetHref: '/profile',
  });
}

export function auditAdminEntity(
  actor: Actor,
  category: string,
  action: string,
  target: {
    type: string;
    id: string;
    label: string;
    href?: string | null;
  },
  note?: string | null,
  metadata?: Prisma.InputJsonValue,
) {
  recordAuditLogSafe({
    category,
    action,
    actorId: actor.id,
    actorRole: actor.role,
    targetType: target.type,
    targetId: target.id,
    targetLabel: target.label,
    targetHref: target.href ?? null,
    note,
    metadata,
  });
}

export function auditBulkArticleAction(
  actor: Actor,
  action: 'approve' | 'reject' | 'archive' | 'delete',
  article: { id: string; title: string },
  note?: string | null,
) {
  recordAuditLogSafe({
    category: 'article',
    action: `bulk_${action}`,
    actorId: actor.id,
    actorRole: actor.role,
    targetType: 'article',
    targetId: article.id,
    targetLabel: article.title,
    targetHref: adminArticleHref(article.id),
    note,
  });
}
