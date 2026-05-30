import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const where: any = {};
  if (status) where.status = status.toUpperCase();

  const articles = await db.article.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      author: { select: { name: true, username: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  return NextResponse.json(articles);
}
