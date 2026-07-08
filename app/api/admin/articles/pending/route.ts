import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async (request: NextRequest) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const shouldPaginate = Boolean(pageParam || limitParam);

  const where = { status: 'PENDING_REVIEW' as const };
  const include = {
    author: { select: { name: true, username: true, email: true } },
    category: { select: { name: true, slug: true } },
  };

  if (!shouldPaginate) {
    const articles = await db.article.findMany({
      where,
      orderBy: { createdAt: 'asc' },
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
      orderBy: { createdAt: 'asc' },
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
