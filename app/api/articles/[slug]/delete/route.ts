import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canCreateArticles, CONTRIBUTOR_REQUIRED_ERROR } from '@/lib/contributor';
import { db } from '@/lib/db';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!canCreateArticles(user)) {
    return NextResponse.json(CONTRIBUTOR_REQUIRED_ERROR, { status: 403 });
  }

  const { slug } = await params;

  const article = await db.article.findFirst({ where: { slug } });
  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

  if (article.authorId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  if (article.status === 'PUBLISHED' && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Cannot delete published articles' }, { status: 400 });
  }

  await db.article.delete({ where: { id: article.id } });
  return NextResponse.json({ message: 'Article deleted' });
}
