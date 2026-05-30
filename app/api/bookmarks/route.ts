import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const bookmarks = await db.bookmark.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      article: {
        include: {
          author: { select: { name: true, username: true } },
          category: { select: { name: true, slug: true } },
        },
      },
    },
  });

  return NextResponse.json(bookmarks.map((b: typeof bookmarks[number]) => b.article).filter(Boolean));
}
