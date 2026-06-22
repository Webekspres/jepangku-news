import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { revisionDetailSelect } from '@/lib/article-audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; revisionId: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id, revisionId } = await params;

  const revision = await db.articleRevision.findFirst({
    where: { id: revisionId, articleId: id },
    select: revisionDetailSelect,
  });

  if (!revision) {
    return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
  }

  const previous = await db.articleRevision.findFirst({
    where: {
      articleId: id,
      revisionNumber: { lt: revision.revisionNumber },
    },
    orderBy: { revisionNumber: 'desc' },
    select: revisionDetailSelect,
  });

  return NextResponse.json({ revision, previous });
}
