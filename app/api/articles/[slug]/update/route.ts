import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSlug, createAdminSlug } from '@/lib/slug';

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
    const { title, excerpt, content, coverImageUrl, categoryId, tags, status } = body;

    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) { updateData.title = title; updateData.slug = createSlug(title); }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (categoryId !== undefined) {
      if (categoryId) {
        const cat = await db.category.findFirst({ where: { OR: [{ id: categoryId }, { slug: categoryId }] } });
        updateData.categoryId = cat?.id ?? null;
      } else {
        updateData.categoryId = null;
      }
    }
    if (status !== undefined) {
      const validStatuses = user.role === 'ADMIN'
        ? ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED']
        : ['DRAFT', 'PENDING_REVIEW'];
      if (validStatuses.includes(status)) {
        updateData.status = status;
        if (status === 'PUBLISHED' && !article.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }
    }

    const updated = await db.article.update({ where: { id: article.id }, data: updateData });

    if (tags !== undefined) {
      await db.articleTag.deleteMany({ where: { articleId: article.id } });
      for (const tagName of tags) {
        if (!tagName.trim()) continue;
        const tagSlug = createAdminSlug(tagName.trim());
        let tag = await db.tag.findUnique({ where: { slug: tagSlug } });
        if (!tag) tag = await db.tag.create({ data: { name: tagName.trim(), slug: tagSlug } });
        await db.articleTag.upsert({
          where: { articleId_tagId: { articleId: article.id, tagId: tag.id } },
          create: { articleId: article.id, tagId: tag.id },
          update: {},
        });
      }
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
