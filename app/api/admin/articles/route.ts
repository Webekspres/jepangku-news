import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSlug } from '@/lib/slug';
import { syncArticleTags, resolveCategoryId } from '@/lib/article-tags';
import {
  buildAdminArticlesWhere,
  buildAdminArticlesOrderBy,
  adminArticleInclude,
} from '@/lib/admin-articles-query';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const where = buildAdminArticlesWhere(searchParams);
  const orderBy = buildAdminArticlesOrderBy(searchParams.get('sort'));

  const articles = await db.article.findMany({
    where,
    orderBy,
    take: 500,
    include: adminArticleInclude,
  });

  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const body = await request.json();
    const {
      title,
      excerpt,
      content,
      coverImageUrl,
      categoryId,
      tags = [],
      status = 'DRAFT',
    } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const validStatuses = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'];
    const articleStatus = validStatuses.includes(status) ? status : 'DRAFT';

    const resolvedCategoryId = await resolveCategoryId(categoryId);
    const slug = createSlug(title);
    const now = new Date();

    const article = await db.article.create({
      data: {
        authorId: admin.id,
        categoryId: resolvedCategoryId,
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || null,
        content,
        coverImageUrl: coverImageUrl || null,
        status: articleStatus as any,
        visibility: 'public',
        publishedAt: articleStatus === 'PUBLISHED' ? now : null,
      },
      include: adminArticleInclude,
    });

    if (Array.isArray(tags) && tags.length > 0) {
      await syncArticleTags(article.id, tags);
    }

    const full = await db.article.findUnique({
      where: { id: article.id },
      include: adminArticleInclude,
    });

    if (articleStatus === 'PUBLISHED') {
      await db.articleReview.create({
        data: {
          articleId: article.id,
          reviewerId: admin.id,
          previousStatus: 'DRAFT',
          newStatus: 'PUBLISHED',
          note: 'Published by admin',
          reviewedAt: now,
        },
      });
    }

    return NextResponse.json(full, { status: 201 });
  } catch (e: any) {
    console.error('Admin create article error:', e);
    return NextResponse.json({ error: e.message || 'Failed to create article' }, { status: 500 });
  }
}
