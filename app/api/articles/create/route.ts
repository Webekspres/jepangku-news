import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSlug, createAdminSlug } from '@/lib/slug';

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

    // Resolve category
    let resolvedCategoryId: string | null = null;
    if (categoryId) {
      const cat = await db.category.findFirst({
        where: { OR: [{ id: categoryId }, { slug: categoryId }] },
      });
      resolvedCategoryId = cat?.id ?? null;
    }

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

    // Handle tags
    if (tags.length > 0) {
      for (const tagName of tags) {
        if (!tagName.trim()) continue;
        const tagSlug = createAdminSlug(tagName.trim());
        let tag = await db.tag.findUnique({ where: { slug: tagSlug } });
        if (!tag) {
          tag = await db.tag.create({ data: { name: tagName.trim(), slug: tagSlug } });
        }
        await db.articleTag.upsert({
          where: { articleId_tagId: { articleId: article.id, tagId: tag.id } },
          create: { articleId: article.id, tagId: tag.id },
          update: {},
        });
      }
    }

    return NextResponse.json(article, { status: 201 });
  } catch (e: any) {
    console.error('Create article error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
