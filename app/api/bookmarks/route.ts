import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return apiError('Not authenticated' , { status: 401 });

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

  return apiSuccess(bookmarks.map((b: typeof bookmarks[number]) => b.article).filter(Boolean));
}
