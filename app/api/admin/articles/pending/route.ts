import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const articles = await db.article.findMany({
    where: { status: 'PENDING_REVIEW' },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { name: true, username: true, email: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  return NextResponse.json(articles);
}
