import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { db } from '@/lib/db';

// GET /api/tags/popular?limit=20
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 50);

  const grouped = await db.articleTag.groupBy({
    by: ['tagId'],
    _count: { tagId: true },
    orderBy: { _count: { tagId: 'desc' } },
    take: limit,
  });

  if (grouped.length === 0) {
    return apiSuccess([]);
  }

  const tagIds = grouped.map((g) => g.tagId);
  const tags = await db.tag.findMany({
    where: { id: { in: tagIds } },
    select: { id: true, name: true, slug: true },
  });

  const countByTag = new Map(grouped.map((g) => [g.tagId, g._count.tagId]));

  const result = tags
    .map((t) => ({
      ...t,
      articleCount: countByTag.get(t.id) || 0,
    }))
    .sort((a, b) => b.articleCount - a.articleCount);

  return apiSuccess(result);
}
