import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { ADMIN_LIST_ARTICLE_STATUSES } from '@/lib/admin-articles-query';
import { getArticlesMissingCategoryCount } from '@/lib/admin-page-stats';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async (request: NextRequest) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const listWhere = { status: { in: [...ADMIN_LIST_ARTICLE_STATUSES] } };

  const [total, pendingReview, published, rejected, archived, viewsAgg, missingCategory] =
    await Promise.all([
      db.article.count({ where: listWhere }),
      db.article.count({ where: { status: 'PENDING_REVIEW' } }),
      db.article.count({ where: { status: 'PUBLISHED' } }),
      db.article.count({ where: { status: 'REJECTED' } }),
      db.article.count({ where: { status: 'ARCHIVED' } }),
      db.article.aggregate({
        where: { status: 'PUBLISHED' },
        _sum: { viewCount: true },
      }),
      getArticlesMissingCategoryCount(),
    ]);

  return apiSuccess({
    total,
    pendingReview,
    published,
    rejected,
    archived,
    totalViews: viewsAgg._sum.viewCount ?? 0,
    missingCategory,
  });
});

export { GET };
