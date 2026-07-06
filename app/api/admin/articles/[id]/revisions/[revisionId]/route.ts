import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { revisionDetailSelect } from '@/lib/article-audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; revisionId: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return apiError('Admin access required' , { status: 403 });
  }

  const { id, revisionId } = await params;

  const revision = await db.articleRevision.findFirst({
    where: { id: revisionId, articleId: id },
    select: revisionDetailSelect,
  });

  if (!revision) {
    return apiError('Revision not found' , { status: 404 });
  }

  const previous = await db.articleRevision.findFirst({
    where: {
      articleId: id,
      revisionNumber: { lt: revision.revisionNumber },
    },
    orderBy: { revisionNumber: 'desc' },
    select: revisionDetailSelect,
  });

  return apiSuccess({ revision, previous });
}
