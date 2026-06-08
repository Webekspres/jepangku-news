import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { awardPoints } from '@/lib/points';
import { enforceRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { captureException } from '@/lib/monitoring';
import {
  buildPublicThread,
  COMMENT_POINTS,
  isValidTargetType,
  normalizeCommentContent,
  resolveCommentTarget,
  type CommentRecord,
} from '@/lib/comments';
import { summarizeCommentReactions } from '@/lib/reactions';

const USER_SELECT = {
  select: { id: true, name: true, username: true, avatarUrl: true, role: true },
} as const;

// GET /api/comments?targetType=ARTICLE&targetId=<id>
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get('targetType');
  const targetId = searchParams.get('targetId');

  if (!isValidTargetType(targetType) || !targetId) {
    return NextResponse.json({ error: 'Parameter target tidak valid' }, { status: 400 });
  }

  const comments = await db.comment.findMany({
    where: { targetType, targetId },
    include: { user: USER_SELECT },
    orderBy: { createdAt: 'asc' },
  });

  const viewer = await getCurrentUser(request).catch(() => null);
  const reactions = await summarizeCommentReactions(
    comments.map((c) => c.id),
    viewer?.id ?? null,
  );

  const thread = buildPublicThread(comments as unknown as CommentRecord[], reactions);
  const total = comments.filter((c) => c.status === 'VISIBLE' && c.deletedAt === null).length;

  return NextResponse.json({ comments: thread, total });
}

// POST /api/comments  { targetType, targetId, content, parentId? }
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  if (user.status === 'banned') {
    return NextResponse.json({ error: 'Akun Anda tidak dapat berkomentar' }, { status: 403 });
  }

  const limited = await enforceRateLimit(request, 'comment-create', {
    max: 10,
    windowMs: 60_000,
    identifier: user.id,
    message: 'Terlalu banyak komentar. Coba lagi sebentar.',
  });
  if (limited) return limited;

  try {
  const body = await request.json().catch(() => ({}));
  const { targetType, targetId, parentId } = body ?? {};

  if (!isValidTargetType(targetType) || typeof targetId !== 'string' || !targetId) {
    return NextResponse.json({ error: 'Parameter target tidak valid' }, { status: 400 });
  }

  const normalized = normalizeCommentContent(body?.content);
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const target = await resolveCommentTarget(targetType, targetId);
  if (!target) {
    return NextResponse.json({ error: 'Konten yang dikomentari tidak ditemukan' }, { status: 404 });
  }

  // Validasi parent untuk balasan: harus komentar top-level pada target yang sama.
  let resolvedParentId: string | null = null;
  if (parentId) {
    if (typeof parentId !== 'string') {
      return NextResponse.json({ error: 'parentId tidak valid' }, { status: 400 });
    }
    const parent = await db.comment.findUnique({ where: { id: parentId } });
    if (
      !parent ||
      parent.targetType !== targetType ||
      parent.targetId !== targetId ||
      parent.parentId !== null ||
      parent.status !== 'VISIBLE' ||
      parent.deletedAt !== null
    ) {
      return NextResponse.json({ error: 'Komentar yang dibalas tidak valid' }, { status: 400 });
    }
    resolvedParentId = parent.id;
  }

  // Catatan: jangan pakai `include` di sini — create+fetch relasi memicu
  // transaksi implisit yang tidak didukung adapter Neon HTTP. Data author
  // dibangun dari `user` yang sudah tersedia dari getCurrentUser.
  const comment = await db.comment.create({
    data: {
      targetType,
      targetId,
      userId: user.id,
      parentId: resolvedParentId,
      content: normalized.content,
    },
  });

  // Poin engagement: sekali per target per user.
  const pointsAwarded = await awardPoints(
    user.id,
    'comment_created',
    targetType.toLowerCase(),
    targetId,
    COMMENT_POINTS,
    `Berkomentar pada ${targetType.toLowerCase()}: ${target.title}`,
  );

  logger.info('comment.created', {
    commentId: comment.id,
    userId: user.id,
    targetType,
    targetId,
    isReply: resolvedParentId !== null,
  });

  return NextResponse.json(
    {
      comment: {
        id: comment.id,
        parentId: comment.parentId,
        content: comment.content,
        isDeleted: false,
        isHidden: false,
        isEdited: false,
        createdAt: comment.createdAt.toISOString(),
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl,
          isAdmin: user.role === 'ADMIN',
        },
        thumbUp: 0,
        thumbDown: 0,
        userReaction: null,
        replies: [],
      },
      pointsAwarded,
      points: pointsAwarded ? COMMENT_POINTS : 0,
    },
    { status: 201 },
  );
  } catch (e) {
    await captureException(e, { route: 'comments-post' });
    return NextResponse.json({ error: 'Gagal membuat komentar' }, { status: 500 });
  }
}
