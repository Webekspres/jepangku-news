import { db } from './db';
import { sanitizeText } from './sanitizer';
import type { CommentTargetType, CommentStatus, ReactionType } from '@prisma/client';

export type CommentReactionInfo = {
  thumbUp: number;
  thumbDown: number;
  userReaction: ReactionType | null;
};

export type CommentReactionMap = Map<string, CommentReactionInfo>;

const EMPTY_REACTION: CommentReactionInfo = { thumbUp: 0, thumbDown: 0, userReaction: null };

export const COMMENT_TARGET_TYPES = ['ARTICLE', 'POLL', 'QUIZ'] as const;
export const MAX_COMMENT_LENGTH = 1000;
export const COMMENT_POINTS = 2;

export function isValidTargetType(value: unknown): value is CommentTargetType {
  return typeof value === 'string' && (COMMENT_TARGET_TYPES as readonly string[]).includes(value);
}

/**
 * Verifikasi entitas target benar-benar ada (dan dapat dikomentari).
 * Mengembalikan judul entitas bila ditemukan, atau null bila tidak.
 */
export async function resolveCommentTarget(
  targetType: CommentTargetType,
  targetId: string,
): Promise<{ title: string } | null> {
  const authorId = await resolveCommentTargetAuthorId(targetType, targetId);
  if (!authorId) return null;

  if (targetType === 'ARTICLE') {
    const article = await db.article.findFirst({
      where: { id: targetId, status: 'PUBLISHED' },
      select: { title: true },
    });
    return article ? { title: article.title } : null;
  }

  if (targetType === 'POLL') {
    const poll = await db.poll.findFirst({
      where: { id: targetId, status: { in: ['ACTIVE', 'CLOSED'] } },
      select: { title: true },
    });
    return poll ? { title: poll.title } : null;
  }

  const quiz = await db.quiz.findFirst({
    where: { id: targetId, status: { in: ['ACTIVE', 'INACTIVE'] } },
    select: { title: true },
  });
  return quiz ? { title: quiz.title } : null;
}

/** User ID penulis/pembuat konten yang dikomentari (artikel, poll, kuis). */
export async function resolveCommentTargetAuthorId(
  targetType: CommentTargetType,
  targetId: string,
): Promise<string | null> {
  if (targetType === 'ARTICLE') {
    const article = await db.article.findFirst({
      where: { id: targetId, status: 'PUBLISHED' },
      select: { authorId: true },
    });
    return article?.authorId ?? null;
  }

  if (targetType === 'POLL') {
    const poll = await db.poll.findFirst({
      where: { id: targetId, status: { in: ['ACTIVE', 'CLOSED'] } },
      select: { createdBy: true },
    });
    return poll?.createdBy ?? null;
  }

  const quiz = await db.quiz.findFirst({
    where: { id: targetId, status: { in: ['ACTIVE', 'INACTIVE'] } },
    select: { createdBy: true },
  });
  return quiz?.createdBy ?? null;
}

/**
 * Validasi & bersihkan isi komentar (plain text, tanpa HTML).
 */
export function normalizeCommentContent(raw: unknown): { ok: true; content: string } | { ok: false; error: string } {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Isi komentar tidak valid' };
  }

  const content = sanitizeText(raw);
  if (content.length === 0) {
    return { ok: false, error: 'Komentar tidak boleh kosong' };
  }
  if (content.length > MAX_COMMENT_LENGTH) {
    return { ok: false, error: `Komentar maksimal ${MAX_COMMENT_LENGTH} karakter` };
  }

  return { ok: true, content };
}

type CommentUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: string;
};

export type CommentRecord = {
  id: string;
  userId: string;
  parentId: string | null;
  content: string;
  status: CommentStatus;
  editedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  user: CommentUser;
};

export type SerializedComment = {
  id: string;
  parentId: string | null;
  content: string | null;
  isDeleted: boolean;
  isHidden: boolean;
  isEdited: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    isAdmin: boolean;
  };
  thumbUp: number;
  thumbDown: number;
  userReaction: ReactionType | null;
  replies: SerializedComment[];
};

function serializeOne(
  c: CommentRecord,
  replies: SerializedComment[],
  reactions?: CommentReactionMap,
): SerializedComment {
  const isDeleted = c.deletedAt !== null;
  const isHidden = c.status === 'HIDDEN';
  const hideContent = isDeleted || isHidden;
  const r = reactions?.get(c.id) ?? EMPTY_REACTION;
  return {
    id: c.id,
    parentId: c.parentId,
    content: hideContent ? null : c.content,
    isDeleted,
    isHidden,
    isEdited: c.editedAt !== null,
    createdAt: c.createdAt.toISOString(),
    author: {
      id: c.user.id,
      name: c.user.name,
      username: c.user.username,
      avatarUrl: c.user.avatarUrl,
      isAdmin: c.user.role === 'ADMIN',
    },
    thumbUp: r.thumbUp,
    thumbDown: r.thumbDown,
    userReaction: r.userReaction,
    replies,
  };
}

/**
 * Bangun struktur thread (satu level) untuk konsumsi publik.
 * - Komentar HIDDEN disembunyikan kecuali masih punya balasan yang tampil (ditampilkan sebagai placeholder).
 * - Komentar terhapus ditampilkan sebagai placeholder hanya bila masih punya balasan yang tampil.
 */
export function buildPublicThread(
  comments: CommentRecord[],
  reactions?: CommentReactionMap,
): SerializedComment[] {
  const roots = comments.filter((c) => c.parentId === null);
  const repliesByParent = new Map<string, CommentRecord[]>();

  for (const c of comments) {
    if (c.parentId) {
      const list = repliesByParent.get(c.parentId) ?? [];
      list.push(c);
      repliesByParent.set(c.parentId, list);
    }
  }

  const result: SerializedComment[] = [];

  for (const root of roots) {
    const childRecords = repliesByParent.get(root.id) ?? [];
    const childSerialized = childRecords
      .filter((c) => c.status !== 'HIDDEN' && c.deletedAt === null)
      .map((c) => serializeOne(c, [], reactions));

    const rootHiddenOrDeleted = root.status === 'HIDDEN' || root.deletedAt !== null;
    // Komentar induk yang disembunyikan/terhapus tanpa balasan tampil → dilewati.
    if (rootHiddenOrDeleted && childSerialized.length === 0) continue;

    result.push(serializeOne(root, childSerialized, reactions));
  }

  return result;
}

/**
 * Hitung jumlah komentar yang tampil untuk sebuah target (untuk badge jumlah).
 */
export async function countVisibleComments(
  targetType: CommentTargetType,
  targetId: string,
): Promise<number> {
  return db.comment.count({
    where: { targetType, targetId, status: 'VISIBLE', deletedAt: null },
  });
}
