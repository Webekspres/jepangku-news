import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const [totalArticles, pendingArticles, publishedArticles, totalUsers, totalQuizzes, totalPolls] =
    await Promise.all([
      db.article.count(),
      db.article.count({ where: { status: 'PENDING_REVIEW' } }),
      db.article.count({ where: { status: 'PUBLISHED' } }),
      db.user.count({ where: { role: 'USER' } }),
      db.quiz.count(),
      db.poll.count(),
    ]);

  return NextResponse.json({
    totalArticles,
    pendingArticles,
    publishedArticles,
    totalUsers,
    totalQuizzes,
    totalPolls,
  });
}
