import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canCreateArticles, CONTRIBUTOR_REQUIRED_ERROR } from '@/lib/contributor';
import { db } from '@/lib/db';

/**
 * GET /api/articles/preview/[id]
 *
 * Returns full article data for preview purposes.
 * Accessible only by the article owner or an admin.
 * Works for any article status (DRAFT, PENDING_REVIEW, REJECTED, etc.).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!canCreateArticles(user)) {
    return NextResponse.json(CONTRIBUTOR_REQUIRED_ERROR, { status: 403 });
  }

  const { id } = await params;

  const article = await db.article.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, username: true, avatarUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
    },
  });

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  const isOwner = article.authorId === user.id;
  const isAdmin = user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  return NextResponse.json({
    ...article,
    tags: article.tags.map((at) => at.tag),
  });
}
