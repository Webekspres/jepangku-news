import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
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
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async (request: NextRequest) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

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
    return apiSuccess(articles);
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

  return apiSuccess({
    articles,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  });
});

const POST = withRequestLogging(async (request: NextRequest) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  try {
    const body = await request.json();
    const {
      id,
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
      return apiError('Title and content are required' , { status: 400 });
    }

    const validStatuses = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'];
    const articleStatus = validStatuses.includes(status) ? status : 'DRAFT';

    const resolvedCategoryId = await resolveCategoryId(categoryId);
    const slug = createSlug(safeTitle);
    const now = new Date();

    // Optional client-supplied id makes autosave/draft flushes idempotent: a
    // repeated POST with the same id updates the existing row instead of
    // creating a duplicate.
    const providedId =
      typeof id === 'string' && id.trim().length > 0 ? id.trim() : null;

    const existing = providedId
      ? await db.article.findUnique({
          where: { id: providedId },
          select: { id: true, authorId: true, status: true, publishedAt: true },
        })
      : null;

    if (existing && existing.authorId !== admin.id) {
      return apiError('Not authorized to edit this article', { status: 403 });
    }

    const created = !existing;
    const sharedData = {
      categoryId: resolvedCategoryId,
      title: safeTitle,
      excerpt: safeExcerpt,
      content: safeContent,
      coverImageUrl: coverImageUrl || null,
      status: articleStatus as any,
    };

    const article = providedId
      ? await db.article.upsert({
          where: { id: providedId },
          create: {
            id: providedId,
            authorId: admin.id,
            slug,
            visibility: 'public',
            publishedAt: articleStatus === 'PUBLISHED' ? now : null,
            ...sharedData,
          },
          update: {
            ...sharedData,
            // Keep the published slug stable; otherwise refresh it.
            ...(existing?.status === 'PUBLISHED' ? {} : { slug }),
            publishedAt:
              articleStatus === 'PUBLISHED'
                ? (existing?.publishedAt ?? now)
                : null,
          },
          include: adminArticleInclude,
        })
      : await db.article.create({
          data: {
            authorId: admin.id,
            slug,
            visibility: 'public',
            publishedAt: articleStatus === 'PUBLISHED' ? now : null,
            ...sharedData,
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

    if (articleStatus === 'PUBLISHED' && existing?.status !== 'PUBLISHED') {
      await recordStatusReview({
        articleId: article.id,
        reviewerId: admin.id,
        previousStatus: existing?.status ?? 'DRAFT',
        newStatus: 'PUBLISHED',
        note: 'Published by admin',
      });
    }

    // Only log the initial creation — repeated autosave upserts must not spam.
    if (created) {
      auditArticleCreate(
        admin,
        { id: article.id, title: article.title, status: article.status },
        'admin',
      );
    }

    return apiSuccess(full, { status: created ? 201 : 200 });
  } catch (e: any) {
    await captureException(e, { route: 'admin-articles-create' });
    return apiError(e.message || 'Failed to create article' , { status: 500 });
  }
});

export { GET, POST };
