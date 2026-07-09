import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { captureException } from '@/lib/monitoring';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/auth';
import { canCreateArticles, CONTRIBUTOR_REQUIRED_ERROR } from '@/lib/contributor';
import {
  canEditOnUserPortal,
  getUserPortalSubmitStatuses,
  resolveUserPortalSubmitStatus,
} from '@/lib/article-workflow';
import { db } from '@/lib/db';
import { createSlug } from '@/lib/slug';
import { syncArticleTags, resolveCategoryId } from '@/lib/article-tags';
import { applyArticleUpdateWithAudit } from '@/lib/article-audit';
import { assignArticleSchedule, parseScheduledPublishAt } from '@/lib/articles/schedule';
import { sanitizeHtmlContent, sanitizeText } from '@/lib/sanitizer';
import { logger } from '@/lib/logger';
import { withRequestLogging } from '@/lib/logging/request-logger';

const PUT = withRequestLogging(async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
  const user = await getCurrentUser(request);
  if (!user) return apiError('Not authenticated' , { status: 401 });
  if (!canCreateArticles(user)) {
    return apiSuccess(CONTRIBUTOR_REQUIRED_ERROR, { status: 403 });
  }

  const { slug } = await params;

  const article = await db.article.findFirst({ where: { slug } });
  if (!article) return apiError('Article not found' , { status: 404 });

  const blockedResponse = await enforceRateLimit(request, 'article-update', {
    max: 6,
    windowMs: 60_000,
    message: 'Too many article update attempts. Please wait a moment.',
    identifier: user.id,
  });

  if (blockedResponse) {
    return blockedResponse;
  }

  if (article.authorId !== user.id) {
    return apiError('Not authorized' , { status: 403 });
  }

  if (!canEditOnUserPortal(article.status)) {
    return apiSuccess(
      { error: 'Artikel tidak dapat diedit pada status ini' },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const { title, excerpt, content, coverImageUrl, categoryId, tags, status, changeNote, scheduledPublishAt } =
      body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) {
      const safeTitle = sanitizeText(String(title || ''));
      if (!safeTitle) {
        return apiError('Title cannot be empty' , { status: 400 });
      }
      updateData.title = safeTitle;
      const keepSlug =
        user.role === 'ADMIN' &&
        article.status === 'PUBLISHED' &&
        body.preserveSlug !== false;
      if (!keepSlug) {
        updateData.slug = createSlug(safeTitle);
      }
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt ? sanitizeText(String(excerpt)) : null;
    if (content !== undefined) {
      const safeContent = sanitizeHtmlContent(String(content || ''));
      if (!safeContent) {
        return apiError('Content cannot be empty' , { status: 400 });
      }
      updateData.content = safeContent;
    }
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (categoryId !== undefined) {
      updateData.categoryId = await resolveCategoryId(categoryId);
    }
    if (status !== undefined) {
      const isAdmin = user.role === 'ADMIN';
      const validStatuses = getUserPortalSubmitStatuses(isAdmin);
      const nextStatus = resolveUserPortalSubmitStatus(String(status), isAdmin);
      if (validStatuses.includes(nextStatus)) {
        updateData.status = nextStatus;
        if (nextStatus === 'PUBLISHED' && !article.publishedAt) {
          updateData.publishedAt = new Date();
        }
        if (nextStatus === 'SCHEDULED') {
          if (!isAdmin) {
            return apiError('Only admin can schedule articles', { status: 403 });
          }
          const parsed = parseScheduledPublishAt(scheduledPublishAt);
          if (!parsed.ok) {
            return apiError(parsed.error, { status: 400 });
          }
          updateData.scheduledPublishAt = parsed.date;
          updateData.publishedAt = null;
          updateData.qstashMessageId = null;
        }
      }
    }

    const start = Date.now();
    const updated = await applyArticleUpdateWithAudit({
      articleId: article.id,
      editorId: user.id,
      editorRole: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
      before: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverImageUrl: article.coverImageUrl,
        categoryId: article.categoryId,
        status: article.status,
      },
      updateData,
      changeNote,
      tags: Array.isArray(tags) ? tags : undefined,
      syncTags: syncArticleTags,
    });

    if (updateData.status === 'SCHEDULED' && updateData.scheduledPublishAt) {
      await assignArticleSchedule({
        articleId: article.id,
        scheduledAt: updateData.scheduledPublishAt as Date,
        previousMessageId: article.qstashMessageId,
      });
    }

    const changedFields = Object.keys(updateData).filter(k => k !== 'slug');
    logger.info('article.updated', {
      articleId: article.id,
      slug: article.slug,
      editorId: user.id,
      changedFields,
      statusChanged: updateData.status && updateData.status !== article.status,
      previousStatus: article.status,
      newStatus: updateData.status || article.status,
      durationMs: Date.now() - start,
    });

    return apiSuccess(updated);
  } catch (e: unknown) {
    await captureException(e, { route: 'articles-update', slug });
    const message = e instanceof Error ? e.message : 'Update failed';
    const status = message.includes('wajib') ? 400 : 500;
    return apiSuccess({ error: message }, { status });
  }
});

export { PUT };
