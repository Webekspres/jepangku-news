import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canCreateArticles, CONTRIBUTOR_REQUIRED_ERROR } from '@/lib/contributor';
import { db } from '@/lib/db';
import { createSlug } from '@/lib/slug';
import { syncArticleTags, resolveCategoryId } from '@/lib/article-tags';

/**
 * PATCH /api/articles/drafts/[id]
 *
 * Partial update for a user's own DRAFT article.
 * Used by the autosave system and the manual-save flow when a draft
 * was already created in the current session.
 *
 * Allowed status transitions: DRAFT → DRAFT | PENDING_REVIEW
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!canCreateArticles(user)) {
    return NextResponse.json(CONTRIBUTOR_REQUIRED_ERROR, { status: 403 });
  }

  const { id } = await params;

  const article = await db.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

  if (article.authorId !== user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  if (!['DRAFT', 'REJECTED'].includes(article.status)) {
    return NextResponse.json(
      { error: 'Only DRAFT or REJECTED articles can be edited' },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const { title, excerpt, content, coverImageUrl, categoryId, tags, status } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = createSlug(title);
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt || null;
    if (content !== undefined) updateData.content = content;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl || null;
    if (categoryId !== undefined) {
      updateData.categoryId = await resolveCategoryId(categoryId);
    }

    if (status !== undefined) {
      const allowed = ['DRAFT', 'PENDING_REVIEW'];
      if (allowed.includes(status)) {
        updateData.status = status;
      }
    }

    const updated = await db.article.update({ where: { id }, data: updateData });

    if (tags !== undefined && Array.isArray(tags)) {
      await syncArticleTags(id, tags);
    }

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update draft';
    console.error('Draft autosave error:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
