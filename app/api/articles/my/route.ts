import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const status = searchParams.get('status');
  const shouldPaginate = Boolean(pageParam || limitParam);

  const where: Prisma.ArticleWhereInput = { authorId: user.id };
  if (status) where.status = status;

  const include = {
    category: { select: { name: true, slug: true } },
    reviews: {
      orderBy: { reviewedAt: 'desc' as const },
      take: 1,
      select: { id: true, previousStatus: true, newStatus: true, note: true, reviewedAt: true },
    },
  };

  if (!shouldPaginate) {
    const articles = await db.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include,
    });
    return NextResponse.json(articles);
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

  return NextResponse.json({
    articles,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  });
}
