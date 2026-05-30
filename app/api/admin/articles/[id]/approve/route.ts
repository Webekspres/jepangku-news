import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  const article = await db.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

  const previousStatus = article.status;

  await db.article.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  });

  await db.articleReview.create({
    data: {
      articleId: id,
      reviewerId: admin.id,
      previousStatus: previousStatus as any,
      newStatus: 'PUBLISHED',
      note: 'Approved',
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json({ message: 'Article approved and published' });
}
