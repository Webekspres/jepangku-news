import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

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

  logger.info('bookmark.list', { userId: user.id, count: bookmarks.length });

  return apiSuccess(bookmarks.map((b: typeof bookmarks[number]) => b.article).filter(Boolean));
}
