import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { captureException } from '@/lib/monitoring';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/auth';
import { canCreateArticles, CONTRIBUTOR_REQUIRED_ERROR } from '@/lib/contributor';
import {
  getUserPortalSubmitStatuses,
  resolveUserPortalSubmitStatus,
} from '@/lib/article-workflow';
import { db } from '@/lib/db';
import { createSlug } from '@/lib/slug';
import { syncArticleTags, resolveCategoryId } from '@/lib/article-tags';
import { sanitizeHtmlContent, sanitizeText } from '@/lib/sanitizer';
import { auditArticleCreate } from '@/lib/audit-routes';
import { dispatchNotificationEventSafe } from '@/lib/notifications/dispatch';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return apiError('Not authenticated' , { status: 401 });
  if (!canCreateArticles(user)) {
    return apiSuccess(CONTRIBUTOR_REQUIRED_ERROR, { status: 403 });
  }

  const blockedResponse = await enforceRateLimit(request, 'submit-article', {
    max: 6,
    windowMs: 60_000,
    message: 'Too many article submissions. Please take a short break before trying again.',
    identifier: user.id,
  });

  if (blockedResponse) {
    return blockedResponse;
  }

  try {
    const body = await request.json();
    const { id, title, excerpt, content, coverImageUrl, categoryId, tags = [], status = 'DRAFT' } = body;

    const safeTitle = sanitizeText(String(title || ''));
    const safeExcerpt = excerpt ? sanitizeText(String(excerpt)) : null;
    const safeContent = sanitizeHtmlContent(String(content || ''));

    if (!safeTitle || !safeContent) {
      return apiError('Title and content are required' , { status: 400 });
    }

    const isAdmin = user.role === 'ADMIN';
    const validStatuses = getUserPortalSubmitStatuses(isAdmin);
    const articleStatus = resolveUserPortalSubmitStatus(String(status || 'DRAFT'), isAdmin);

    if (!validStatuses.includes(articleStatus)) {
      return apiError('Invalid article status' , { status: 400 });
    }

    const slug = createSlug(safeTitle);

    const resolvedCategoryId = await resolveCategoryId(categoryId);

    // Optional client-supplied id makes autosave/draft flushes idempotent.
    const providedId =
      typeof id === 'string' && id.trim().length > 0 ? id.trim() : null;

    const existing = providedId
      ? await db.article.findUnique({
          where: { id: providedId },
          select: { id: true, authorId: true, status: true, publishedAt: true },
        })
      : null;

    if (existing && existing.authorId !== user.id) {
      return apiError('Not authorized to edit this article', { status: 403 });
    }

    const created = !existing;
    const now = new Date();
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
            authorId: user.id,
            slug,
            visibility: 'public',
            publishedAt: articleStatus === 'PUBLISHED' ? now : null,
            ...sharedData,
          },
          update: {
            ...sharedData,
            ...(existing?.status === 'PUBLISHED' ? {} : { slug }),
            publishedAt:
              articleStatus === 'PUBLISHED'
                ? (existing?.publishedAt ?? now)
                : null,
          },
        })
      : await db.article.create({
          data: {
            authorId: user.id,
            slug,
            visibility: 'public',
            publishedAt: articleStatus === 'PUBLISHED' ? now : null,
            ...sharedData,
          },
        });

    if (tags.length > 0) {
      await syncArticleTags(article.id, tags);
    }

    if (created) {
      auditArticleCreate(
        user,
        { id: article.id, title: article.title, status: article.status },
        'user',
      );
    }

    if (
      article.status === 'PENDING_REVIEW' &&
      existing?.status !== 'PENDING_REVIEW'
    ) {
      dispatchNotificationEventSafe({
        type: 'article.status_changed',
        articleId: article.id,
        reviewerId: user.id,
        previousStatus: existing?.status ?? 'DRAFT',
        newStatus: 'PENDING_REVIEW',
      });
    }

    return apiSuccess(article, { status: created ? 201 : 200 });
  } catch (e: any) {
    await captureException(e, { route: 'articles-create', userId: user.id });
    return apiError(e.message , { status: 500 });
  }
}
