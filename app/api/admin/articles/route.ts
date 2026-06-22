import { NextRequest, NextResponse } from 'next/server';
import { captureException } from '@/lib/monitoring';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSlug } from '@/lib/slug';
import { syncArticleTags, resolveCategoryId } from '@/lib/article-tags';
import {
  buildAdminArticlesWhere,
  buildAdminArticlesOrderBy,
  adminArticleInclude,
} from '@/lib/admin-articles-query';
import { sanitizeHtmlContent, sanitizeText } from '@/lib/sanitizer';
import { recordStatusReview } from '@/lib/article-audit';
import { auditArticleCreate } from '@/lib/audit-routes';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const where = buildAdminArticlesWhere(searchParams);
  const orderBy = buildAdminArticlesOrderBy(searchParams.get('sort'));
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const shouldPaginate = Boolean(pageParam || limitParam);

  if (!shouldPaginate) {
    const articles = await db.article.findMany({
      where,
      orderBy,
      take: 500,
      include: adminArticleInclude,
    });
    return NextResponse.json(articles);
  }

  const page = Math.max(Number(pageParam || '1'), 1);
  const limit = Math.min(Math.max(Number(limitParam || '20'), 1), 100);
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: adminArticleInclude,
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

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const body = await request.json();
    const {
      title,
      excerpt,
      content,
      coverImageUrl,
      categoryId,
      tags = [],
      status = 'DRAFT',
    } = body;

    const safeTitle = sanitizeText(String(title || ''));
    const safeExcerpt = excerpt ? sanitizeText(String(excerpt)) : null;
    const safeContent = sanitizeHtmlContent(String(content || ''));

    if (!safeTitle || !safeContent) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const validStatuses = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'];
    const articleStatus = validStatuses.includes(status) ? status : 'DRAFT';

    const resolvedCategoryId = await resolveCategoryId(categoryId);
    const slug = createSlug(safeTitle);
    const now = new Date();

    const article = await db.article.create({
      data: {
        authorId: admin.id,
        categoryId: resolvedCategoryId,
        title: safeTitle,
        slug,
        excerpt: safeExcerpt,
        content: safeContent,
        coverImageUrl: coverImageUrl || null,
        status: articleStatus as any,
        visibility: 'public',
        publishedAt: articleStatus === 'PUBLISHED' ? now : null,
      },
      include: adminArticleInclude,
    });

    if (Array.isArray(tags) && tags.length > 0) {
      await syncArticleTags(article.id, tags);
    }

    const full = await db.article.findUnique({
      where: { id: article.id },
      include: adminArticleInclude,
    });

    if (articleStatus === 'PUBLISHED') {
      await recordStatusReview({
        articleId: article.id,
        reviewerId: admin.id,
        previousStatus: 'DRAFT',
        newStatus: 'PUBLISHED',
        note: 'Published by admin',
      });
    }

    auditArticleCreate(
      admin,
      { id: article.id, title: article.title, status: article.status },
      'admin',
    );

    return NextResponse.json(full, { status: 201 });
  } catch (e: any) {
    await captureException(e, { route: 'admin-articles-create' });
    return NextResponse.json({ error: e.message || 'Failed to create article' }, { status: 500 });
  }
}
