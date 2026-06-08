import { NextRequest, NextResponse } from 'next/server';
import { captureException } from '@/lib/monitoring';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSlug } from '@/lib/slug';
import { syncArticleTags, resolveCategoryId } from '@/lib/article-tags';
import { applyArticleUpdateWithAudit } from '@/lib/article-audit';
import { sanitizeHtmlContent, sanitizeText } from '@/lib/sanitizer';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { slug } = await params;

  const article = await db.article.findFirst({ where: { slug } });
  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

  const blockedResponse = await enforceRateLimit(request, 'article-update', {
    max: 6,
    windowMs: 60_000,
    message: 'Too many article update attempts. Please wait a moment.',
    identifier: user.id,
  });

  if (blockedResponse) {
    return blockedResponse;
  }

  if (article.authorId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  if (!['DRAFT', 'REJECTED'].includes(article.status) && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Can only edit draft or rejected articles' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, excerpt, content, coverImageUrl, categoryId, tags, status, changeNote } =
      body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) {
      const safeTitle = sanitizeText(String(title || ''));
      if (!safeTitle) {
        return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
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
        return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
      }
      updateData.content = safeContent;
    }
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (categoryId !== undefined) {
      updateData.categoryId = await resolveCategoryId(categoryId);
    }
    if (status !== undefined) {
      const validStatuses =
        user.role === 'ADMIN'
          ? ['PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED']
          : ['DRAFT', 'PENDING_REVIEW'];
      if (validStatuses.includes(status)) {
        updateData.status = status;
        if (status === 'PUBLISHED' && !article.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }
    }

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

    return NextResponse.json(updated);
  } catch (e: unknown) {
    await captureException(e, { route: 'articles-update', slug });
    const message = e instanceof Error ? e.message : 'Update failed';
    const status = message.includes('wajib') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
