import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSlug } from '@/lib/slug';
import { syncArticleTags, resolveCategoryId } from '@/lib/article-tags';
import { adminArticleInclude } from '@/lib/admin-articles-query';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  const article = await db.article.findUnique({
    where: { id },
    include: adminArticleInclude,
  });

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  if (article.status === 'DRAFT') {
    return NextResponse.json(
      { error: 'Draft articles are only visible to their author' },
      { status: 403 },
    );
  }

  return NextResponse.json({
    ...article,
    tags: article.tags.map((at) => at.tag),
  });
}

/**
 * PATCH /api/admin/articles/[id]
 *
 * Partial update for any article. Used by the admin autosave system
 * and the manual-save flow when a draft was already created in the
 * current session. Supports all status transitions available to admins.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  const article = await db.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

  if (article.status === 'DRAFT') {
    return NextResponse.json(
      { error: 'Draft articles can only be edited by their author' },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { title, excerpt, content, coverImageUrl, categoryId, tags, status } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (title !== undefined) {
      updateData.title = title;
      // Preserve slug for published articles to avoid breaking links
      if (article.status !== 'PUBLISHED') {
        updateData.slug = createSlug(title);
      }
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt || null;
    if (content !== undefined) updateData.content = content;
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

    const updated = await db.article.update({
      where: { id },
      data: updateData,
      include: adminArticleInclude,
    });

    if (tags !== undefined && Array.isArray(tags)) {
      await syncArticleTags(id, tags);
    }

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update article';
    console.error('Admin article PATCH error:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
