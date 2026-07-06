import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { recordStatusReview, setLastEditor } from '@/lib/article-audit';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { note } = body;

  const article = await db.article.findUnique({ where: { id } });
  if (!article) return apiError('Article not found' , { status: 404 });

  const previousStatus = article.status;

  await db.article.update({ where: { id }, data: { status: 'REJECTED' } });

  await recordStatusReview({
    articleId: id,
    reviewerId: admin.id,
    previousStatus,
    newStatus: 'REJECTED',
    note: note?.trim() || 'Ditolak',
  });
  await setLastEditor(id, admin.id);

  return apiSuccess({ message: 'Article rejected' });
}
