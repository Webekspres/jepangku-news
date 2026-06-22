import { Prisma } from '@prisma/client';

export type AdminArticlesSort = 'latest' | 'oldest' | 'popular' | 'published';

/** Statuses visible on admin "Semua Artikel" — excludes author-only DRAFT. */
export const ADMIN_LIST_ARTICLE_STATUSES = [
  'PENDING_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'ARCHIVED',
] as const;

export function buildAdminArticlesWhere(searchParams: URLSearchParams): Prisma.ArticleWhereInput {
  const where: Prisma.ArticleWhereInput = {};

  const status = searchParams.get('status')?.toUpperCase();
  if (status === 'DRAFT') {
    // Drafts belong to authors only; never list them for admin.
    where.status = { in: [] };
  } else if (
    status &&
    ADMIN_LIST_ARTICLE_STATUSES.includes(status as (typeof ADMIN_LIST_ARTICLE_STATUSES)[number])
  ) {
    where.status = status as Prisma.ArticleWhereInput['status'];
  } else {
    where.status = { in: [...ADMIN_LIST_ARTICLE_STATUSES] };
  }

  const authorId = searchParams.get('authorId');
  if (authorId) where.authorId = authorId;

  const missingCategory = searchParams.get('missingCategory');
  if (missingCategory === 'true' || missingCategory === '1') {
    where.categoryId = null;
  } else {
    const categoryId = searchParams.get('categoryId');
    if (categoryId) {
      where.category = {
        OR: [{ id: categoryId }, { slug: categoryId }],
      };
    }
  }

  const search = searchParams.get('search')?.trim();
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  return where;
}

export function buildAdminArticlesOrderBy(
  sort: string | null,
): Prisma.ArticleOrderByWithRelationInput {
  switch (sort) {
    case 'oldest':
      return { createdAt: 'asc' };
    case 'popular':
      return { viewCount: 'desc' };
    case 'published':
      return { publishedAt: 'desc' };
    case 'latest':
    default:
      return { createdAt: 'desc' };
  }
}

export const adminArticleInclude = {
  author: { select: { id: true, name: true, username: true } },
  category: { select: { id: true, name: true, slug: true } },
  tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
} as const;
