import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const article = await db.article.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: {
        author: { select: { name: true, username: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Increment view count
    await db.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 }, weeklyViewCount: { increment: 1 } },
    });

    // Related articles
    let relatedArticles: any[] = [];
    if (article.categoryId) {
      relatedArticles = await db.article.findMany({
        where: {
          categoryId: article.categoryId,
          status: 'PUBLISHED',
          id: { not: article.id },
        },
        take: 3,
        include: {
          author: { select: { name: true, username: true } },
          category: { select: { name: true, slug: true } },
        },
      });
    }

    const result = {
      ...article,
      tags: article.tags.map((at: { tag: { id: string; name: string; slug: string } }) => at.tag),
      relatedArticles,
    };

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('Get article error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
