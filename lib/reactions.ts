import { db } from './db';
import type { ReactionTargetType, ReactionType } from '@prisma/client';

export const REACTION_TARGET_TYPES = ['ARTICLE', 'POLL', 'QUIZ', 'COMMENT', 'VIDEO'] as const;

// Reaksi konten (artikel, quiz, polling/voting) — ditampilkan di atas kolom komentar.
export const ARTICLE_REACTION_TYPES = [
  'LOVE',
  'LOL',
  'CUTE',
  'WIN',
  'WTF',
  'OMG',
  'GEEKY',
  'SCARY',
  'FAIL',
] as const;

// Reaksi komentar — hanya jempol naik/turun.
export const COMMENT_REACTION_TYPES = ['THUMB_UP', 'THUMB_DOWN'] as const;

export function isValidReactionTargetType(value: unknown): value is ReactionTargetType {
  return typeof value === 'string' && (REACTION_TARGET_TYPES as readonly string[]).includes(value);
}

/**
 * Daftar reaksi yang valid untuk sebuah tipe target.
 * COMMENT hanya boleh up/down; konten lain memakai 9 reaksi.
 */
export function allowedReactionsFor(targetType: ReactionTargetType): readonly ReactionType[] {
  return (
    targetType === 'COMMENT' ? COMMENT_REACTION_TYPES : ARTICLE_REACTION_TYPES
  ) as readonly ReactionType[];
}

export function isReactionAllowed(targetType: ReactionTargetType, type: unknown): type is ReactionType {
  return typeof type === 'string' && (allowedReactionsFor(targetType) as readonly string[]).includes(type);
}

/**
 * Verifikasi entitas target benar-benar ada (dan dapat direaksi).
 * Mengembalikan true bila ditemukan, false bila tidak.
 */
export async function reactionTargetExists(
  targetType: ReactionTargetType,
  targetId: string,
): Promise<boolean> {
  if (targetType === 'ARTICLE') {
    const article = await db.article.findFirst({
      where: { id: targetId, status: 'PUBLISHED' },
      select: { id: true },
    });
    return article !== null;
  }

  if (targetType === 'POLL') {
    const poll = await db.poll.findFirst({
      where: { id: targetId, status: { in: ['ACTIVE', 'CLOSED'] } },
      select: { id: true },
    });
    return poll !== null;
  }

  if (targetType === 'QUIZ') {
    const quiz = await db.quiz.findFirst({
      where: { id: targetId, status: { in: ['ACTIVE', 'INACTIVE'] } },
      select: { id: true },
    });
    return quiz !== null;
  }

  if (targetType === 'VIDEO') {
    const video = await db.video.findFirst({
      where: { id: targetId, status: 'PUBLISHED' },
      select: { id: true },
    });
    return video !== null;
  }

  // COMMENT: hanya komentar yang tampil dan belum dihapus yang dapat direaksi.
  const comment = await db.comment.findFirst({
    where: { id: targetId, status: 'VISIBLE', deletedAt: null },
    select: { id: true },
  });
  return comment !== null;
}

export type ReactionSummary = {
  counts: Record<string, number>;
  total: number;
  userReaction: ReactionType | null;
};

function emptyCounts(targetType: ReactionTargetType): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const type of allowedReactionsFor(targetType)) {
    counts[type] = 0;
  }
  return counts;
}

/**
 * Agregasi reaksi untuk satu target: jumlah per tipe, total, dan reaksi user saat ini.
 */
export async function summarizeReactions(
  targetType: ReactionTargetType,
  targetId: string,
  userId?: string | null,
): Promise<ReactionSummary> {
  const grouped = await db.reaction.groupBy({
    by: ['type'],
    where: { targetType, targetId },
    _count: { type: true },
  });

  const counts = emptyCounts(targetType);
  let total = 0;
  for (const row of grouped) {
    counts[row.type] = row._count.type;
    total += row._count.type;
  }

  let userReaction: ReactionType | null = null;
  if (userId) {
    const own = await db.reaction.findUnique({
      where: { targetType_targetId_userId: { targetType, targetId, userId } },
      select: { type: true },
    });
    userReaction = own?.type ?? null;
  }

  return { counts, total, userReaction };
}

/**
 * Agregasi reaksi up/down untuk banyak komentar sekaligus (hindari N+1).
 * Mengembalikan map: commentId -> { thumbUp, thumbDown, userReaction }.
 */
export async function summarizeCommentReactions(
  commentIds: string[],
  userId?: string | null,
): Promise<Map<string, { thumbUp: number; thumbDown: number; userReaction: ReactionType | null }>> {
  const result = new Map<string, { thumbUp: number; thumbDown: number; userReaction: ReactionType | null }>();
  if (commentIds.length === 0) return result;

  for (const id of commentIds) {
    result.set(id, { thumbUp: 0, thumbDown: 0, userReaction: null });
  }

  const grouped = await db.reaction.groupBy({
    by: ['targetId', 'type'],
    where: { targetType: 'COMMENT', targetId: { in: commentIds } },
    _count: { type: true },
  });

  for (const row of grouped) {
    const entry = result.get(row.targetId);
    if (!entry) continue;
    if (row.type === 'THUMB_UP') entry.thumbUp = row._count.type;
    else if (row.type === 'THUMB_DOWN') entry.thumbDown = row._count.type;
  }

  if (userId) {
    const own = await db.reaction.findMany({
      where: { targetType: 'COMMENT', targetId: { in: commentIds }, userId },
      select: { targetId: true, type: true },
    });
    for (const r of own) {
      const entry = result.get(r.targetId);
      if (entry) entry.userReaction = r.type;
    }
  }

  return result;
}
