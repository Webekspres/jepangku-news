import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { recordStatusReview, setLastEditor } from '@/lib/article-audit';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  const article = await db.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

  const previousStatus = article.status;

  await db.article.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: article.publishedAt ?? new Date() },
  });

  await recordStatusReview({
    articleId: id,
    reviewerId: admin.id,
    previousStatus,
    newStatus: 'PUBLISHED',
    note: 'Disetujui dan dipublikasikan',
  });
  await setLastEditor(id, admin.id);

  return NextResponse.json({ message: 'Article approved and published' });
}
