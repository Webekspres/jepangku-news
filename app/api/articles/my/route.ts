import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { Prisma, ArticleStatus } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { canCreateArticles, CONTRIBUTOR_REQUIRED_ERROR } from '@/lib/contributor';
import { db } from '@/lib/db';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async (request: NextRequest) => {
  const user = await getCurrentUser(request);
  if (!user) return apiError('Not authenticated' , { status: 401 });
  if (!canCreateArticles(user)) {
    return apiSuccess(CONTRIBUTOR_REQUIRED_ERROR, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const status = searchParams.get('status');
  const shouldPaginate = Boolean(pageParam || limitParam);

  const where: Prisma.ArticleWhereInput = { authorId: user.id };
  if (status) where.status = status as ArticleStatus;

  const include = {
    category: { select: { name: true, slug: true } },
    lastEditedBy: { select: { id: true, name: true, role: true } },
    reviews: {
      orderBy: { reviewedAt: 'desc' as const },
      take: 1,
      select: {
        id: true,
        previousStatus: true,
        newStatus: true,
        note: true,
        reviewedAt: true,
        reviewer: { select: { id: true, name: true, role: true } },
      },
    },
    _count: { select: { revisions: true, reviews: true } },
  };

  if (!shouldPaginate) {
    const articles = await db.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include,
    });
    return apiSuccess(articles);
  }

  const page = Math.max(Number(pageParam || '1'), 1);
  const limit = Math.min(Math.max(Number(limitParam || '10'), 1), 50);
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include,
      skip,
      take: limit,
    }),
    db.article.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return apiSuccess({
    articles,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  });
});

export { GET };
