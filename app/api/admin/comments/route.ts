import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { isValidTargetType } from '@/lib/comments';
import type { CommentStatus, CommentTargetType, Prisma } from '@prisma/client';

const PAGE_SIZE = 20;

// GET /api/admin/comments?status=&targetType=&q=&page=
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  const targetTypeParam = searchParams.get('targetType');
  const q = searchParams.get('q')?.trim();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const where: Prisma.CommentWhereInput = {};
  if (statusParam === 'VISIBLE' || statusParam === 'HIDDEN') {
    where.status = statusParam as CommentStatus;
  }
  if (statusParam === 'DELETED') {
    where.deletedAt = { not: null };
  }
  if (isValidTargetType(targetTypeParam)) {
    where.targetType = targetTypeParam;
  }
  if (q) {
    where.content = { contains: q, mode: 'insensitive' };
  }

  const [comments, total] = await Promise.all([
    db.comment.findMany({
      where,
      include: { user: { select: { id: true, name: true, username: true, avatarUrl: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.comment.count({ where }),
  ]);

  // Resolusi judul target secara batch per tipe.
  const idsByType: Record<CommentTargetType, Set<string>> = {
    ARTICLE: new Set(),
    POLL: new Set(),
    QUIZ: new Set(),
    VIDEO: new Set(),
  };
  for (const c of comments) idsByType[c.targetType].add(c.targetId);

  const [articles, polls, quizzes, videos] = await Promise.all([
    idsByType.ARTICLE.size
      ? db.article.findMany({ where: { id: { in: [...idsByType.ARTICLE] } }, select: { id: true, title: true, slug: true } })
      : Promise.resolve([]),
    idsByType.POLL.size
      ? db.poll.findMany({ where: { id: { in: [...idsByType.POLL] } }, select: { id: true, title: true, slug: true } })
      : Promise.resolve([]),
    idsByType.QUIZ.size
      ? db.quiz.findMany({ where: { id: { in: [...idsByType.QUIZ] } }, select: { id: true, title: true, slug: true } })
      : Promise.resolve([]),
    idsByType.VIDEO.size
      ? db.video.findMany({ where: { id: { in: [...idsByType.VIDEO] } }, select: { id: true, title: true, slug: true } })
      : Promise.resolve([]),
  ]);

  const titleMap = new Map<string, { title: string; slug: string }>();
  for (const a of articles) titleMap.set(`ARTICLE:${a.id}`, { title: a.title, slug: a.slug });
  for (const p of polls) titleMap.set(`POLL:${p.id}`, { title: p.title, slug: p.slug });
  for (const qz of quizzes) titleMap.set(`QUIZ:${qz.id}`, { title: qz.title, slug: qz.slug });
  for (const v of videos) titleMap.set(`VIDEO:${v.id}`, { title: v.title, slug: v.slug });

  const data = comments.map((c) => {
    const target = titleMap.get(`${c.targetType}:${c.targetId}`);
    return {
      id: c.id,
      content: c.content,
      status: c.status,
      isDeleted: c.deletedAt !== null,
      isEdited: c.editedAt !== null,
      parentId: c.parentId,
      createdAt: c.createdAt.toISOString(),
      targetType: c.targetType,
      targetId: c.targetId,
      targetTitle: target?.title ?? '(dihapus)',
      targetSlug: target?.slug ?? null,
      author: {
        id: c.user.id,
        name: c.user.name,
        username: c.user.username,
        avatarUrl: c.user.avatarUrl,
        isAdmin: c.user.role === 'ADMIN',
      },
    };
  });

  return apiSuccess({
    comments: data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
}
