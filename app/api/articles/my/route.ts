import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const articles = await db.article.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true, slug: true } },
      reviews: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  return NextResponse.json(articles);
}
