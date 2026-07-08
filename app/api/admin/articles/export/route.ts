import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
  buildAdminArticlesWhere,
  buildAdminArticlesOrderBy,
  adminArticleInclude,
} from '@/lib/admin-articles-query';
import { withRequestLogging } from '@/lib/logging/request-logger';

function escapeCsv(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const GET = withRequestLogging(async (request: NextRequest) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return apiError('Admin access required', { status: 403, code: 'FORBIDDEN' });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  const articles = await db.article.findMany({
    where: buildAdminArticlesWhere(searchParams),
    orderBy: buildAdminArticlesOrderBy(searchParams.get('sort')),
    take: 5000,
    include: adminArticleInclude,
  });

  const rows = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    status: a.status,
    author: a.author?.name || a.author?.username || '',
    category: a.category?.name || '',
    tags: a.tags.map((t) => t.tag.name).join('; '),
    viewCount: a.viewCount,
    publishedAt: a.publishedAt?.toISOString() ?? '',
    createdAt: a.createdAt.toISOString(),
  }));

  logger.info('admin.articles.exported', {
    adminId: admin.id,
    format,
    recordCount: rows.length,
  });

  if (format === 'csv') {
    const headers = [
      'id',
      'title',
      'slug',
      'status',
      'author',
      'category',
      'tags',
      'viewCount',
      'publishedAt',
      'createdAt',
    ];
    const lines = [
      headers.join(','),
      ...rows.map((r) =>
        headers.map((h) => escapeCsv((r as Record<string, string | number>)[h])).join(','),
      ),
    ];
    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="articles-export-${Date.now()}.csv"`,
      },
    });
  }

  return apiSuccess(rows, { message: 'Articles exported successfully.' });
});

export { GET };
