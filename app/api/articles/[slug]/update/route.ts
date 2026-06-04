import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSlug } from '@/lib/slug';
import { syncArticleTags, resolveCategoryId } from '@/lib/article-tags';
import { applyArticleUpdateWithAudit } from '@/lib/article-audit';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { slug } = await params;

  const article = await db.article.findFirst({ where: { slug } });
  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

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
      updateData.title = title;
      const keepSlug =
        user.role === 'ADMIN' &&
        article.status === 'PUBLISHED' &&
        body.preserveSlug !== false;
      if (!keepSlug) {
        updateData.slug = createSlug(title);
      }
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
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
    const message = e instanceof Error ? e.message : 'Update failed';
    const status = message.includes('wajib') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
