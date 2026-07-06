import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { getDashboardChartData } from '@/lib/analytics';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const [
    totalArticles,
    pendingArticles,
    publishedArticles,
    totalUsers,
    totalQuizzes,
    totalPolls,
    charts,
  ] = await Promise.all([
    db.article.count(),
    db.article.count({ where: { status: 'PENDING_REVIEW' } }),
    db.article.count({ where: { status: 'PUBLISHED' } }),
    db.user.count(),
    db.quiz.count(),
    db.poll.count(),
    getDashboardChartData(),
  ]);

  return apiSuccess({
    totalArticles,
    pendingArticles,
    publishedArticles,
    totalUsers,
    totalQuizzes,
    totalPolls,
    charts,
  });
}
