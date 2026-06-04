import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSlug } from '@/lib/slug';
import { syncArticleTags, resolveCategoryId } from '@/lib/article-tags';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const body = await request.json();
    const { title, excerpt, content, coverImageUrl, categoryId, tags = [], status = 'DRAFT' } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const validStatuses = ['DRAFT', 'PENDING_REVIEW'];
    const articleStatus = validStatuses.includes(status) ? status : 'DRAFT';

    const slug = createSlug(title);

    const resolvedCategoryId = await resolveCategoryId(categoryId);

    const article = await db.article.create({
      data: {
        authorId: user.id,
        categoryId: resolvedCategoryId,
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImageUrl: coverImageUrl || null,
        status: articleStatus as any,
        visibility: 'public',
        publishedAt: articleStatus === 'PUBLISHED' ? new Date() : null,
      },
    });

    if (tags.length > 0) {
      await syncArticleTags(article.id, tags);
    }

    return NextResponse.json(article, { status: 201 });
  } catch (e: any) {
    console.error('Create article error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
