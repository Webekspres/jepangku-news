import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { captureException } from '@/lib/monitoring';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSlug } from '@/lib/slug';
import { syncArticleTags, resolveCategoryId } from '@/lib/article-tags';
import { adminArticleInclude } from '@/lib/admin-articles-query';
import { applyArticleUpdateWithAudit } from '@/lib/article-audit';
import { sanitizeHtmlContent, sanitizeText } from '@/lib/sanitizer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;

  const article = await db.article.findUnique({
    where: { id },
    include: {
      ...adminArticleInclude,
      lastEditedBy: { select: { id: true, name: true, role: true } },
      _count: { select: { revisions: true, reviews: true } },
    },
  });

  if (!article) {
    return apiError('Article not found' , { status: 404 });
  }

  if (article.status === 'DRAFT' && article.authorId !== admin.id) {
    return apiError('Draft articles are only visible to their author', { status: 403 });
  }

  return apiSuccess({
    ...article,
    tags: article.tags.map((at) => at.tag),
  });
}

/**
 * PATCH /api/admin/articles/[id]
 *
 * Partial update for any article. Requires changeNote when admin edits content.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;

  const article = await db.article.findUnique({ where: { id } });
  if (!article) return apiError('Article not found' , { status: 404 });

  if (article.status === 'DRAFT' && article.authorId !== admin.id) {
    return apiError('Draft articles can only be edited by their author', { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, excerpt, content, coverImageUrl, categoryId, tags, status, changeNote } =
      body;

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      const safeTitle = sanitizeText(String(title || ''));
      if (!safeTitle) {
        return apiError('Title cannot be empty' , { status: 400 });
      }
      updateData.title = safeTitle;
      if (article.status !== 'PUBLISHED') {
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
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl || null;
    if (categoryId !== undefined) {
      updateData.categoryId = await resolveCategoryId(categoryId);
    }

    if (status !== undefined) {
      const allowed = ['PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED'];
      if (allowed.includes(status)) {
        updateData.status = status;
        if (status === 'PUBLISHED' && !article.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }
    }

    const updated = await applyArticleUpdateWithAudit({
      articleId: id,
      editorId: admin.id,
      editorRole: 'ADMIN',
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

    const full = await db.article.findUnique({
      where: { id },
      include: adminArticleInclude,
    });

    return apiSuccess(full ?? updated);
  } catch (e: unknown) {
    await captureException(e, { route: 'admin-articles-patch', id });
    const message = e instanceof Error ? e.message : 'Failed to update article';
    const status = message.includes('wajib') ? 400 : 500;
    return apiError(message, { status });
  }
}
