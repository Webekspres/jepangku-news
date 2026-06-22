import { db } from '@/lib/db';
import { ADMIN_LIST_ARTICLE_STATUSES } from '@/lib/admin-articles-query';
import { getAdminSocialLinks } from '@/lib/social-links';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getInfoPagesStats() {
  const total = await db.infoPage.count();
  return { total };
}

export async function getReviewStats() {
  const pendingWhere = { status: 'PENDING_REVIEW' as const };
  const [totalReview, contributorGroups] = await Promise.all([
    db.article.count({ where: pendingWhere }),
    db.article.groupBy({
      by: ['authorId'],
      where: {
        ...pendingWhere,
        author: { role: 'CONTRIBUTOR' },
      },
    }),
  ]);
  return {
    totalReview,
    contributorsWaiting: contributorGroups.length,
  };
}

export async function getSocialLinksStats() {
  const links = await getAdminSocialLinks();
  const withUrl = links.filter((link) => link.href?.trim());
  const active = withUrl.filter((link) => link.isEnabled);
  return { total: withUrl.length, active: active.length };
}

export async function getHomepageStats() {
  const published = { status: 'PUBLISHED' as const };
  const [featured, hot] = await Promise.all([
    db.article.count({ where: { ...published, isFeatured: true } }),
    db.article.count({ where: { ...published, isHot: true } }),
  ]);
  return { featured, hot };
}

export async function getNewsletterStats() {
  const subscriptions = await db.newsletterSubscription.findMany({
    select: { email: true, userId: true },
  });
  const userEmails = new Set(
    (await db.user.findMany({ select: { email: true } })).map((u) =>
      u.email.toLowerCase(),
    ),
  );

  let fromUser = 0;
  for (const sub of subscriptions) {
    if (sub.userId || userEmails.has(sub.email.toLowerCase())) {
      fromUser += 1;
    }
  }

  const total = subscriptions.length;
  return { total, fromUser, nonUser: total - fromUser };
}

export async function getAdsStats() {
  const [total, active] = await Promise.all([
    db.adSlot.count(),
    db.adSlot.count({ where: { isActive: true } }),
  ]);
  return { total, active };
}

export async function getVideosStats() {
  const [total, published, draft] = await Promise.all([
    db.video.count(),
    db.video.count({ where: { status: 'PUBLISHED' } }),
    db.video.count({ where: { status: 'DRAFT' } }),
  ]);
  return { total, published, draft };
}

export async function getQuizzesStats() {
  const [total, active, draft, inactive] = await Promise.all([
    db.quiz.count(),
    db.quiz.count({ where: { status: 'ACTIVE' } }),
    db.quiz.count({ where: { status: 'DRAFT' } }),
    db.quiz.count({ where: { status: 'INACTIVE' } }),
  ]);
  return { total, active, draft, inactive };
}

export async function getPollsStats() {
  const [total, active, draft, closed] = await Promise.all([
    db.poll.count(),
    db.poll.count({ where: { status: 'ACTIVE' } }),
    db.poll.count({ where: { status: 'DRAFT' } }),
    db.poll.count({ where: { status: 'CLOSED' } }),
  ]);
  return { total, active, draft, closed };
}

export async function getContributorsStats() {
  const [total, approved, rejected, pending] = await Promise.all([
    db.contributorApplication.count(),
    db.contributorApplication.count({ where: { status: 'APPROVED' } }),
    db.contributorApplication.count({ where: { status: 'REJECTED' } }),
    db.contributorApplication.count({ where: { status: 'PENDING' } }),
  ]);
  return { total, approved, rejected, pending };
}

export async function getUsersStats() {
  const [total, active, banned, inactive, draft] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: 'active' } }),
    db.user.count({ where: { status: 'banned' } }),
    db.user.count({ where: { status: 'inactive' } }),
    db.user.count({
      where: {
        OR: [{ profile: null }, { profile: { welcomedAt: null } }],
      },
    }),
  ]);
  return { total, active, banned, inactive, draft };
}

export async function getCommentsStats() {
  const notDeleted = { deletedAt: null };
  const [
    total,
    articleComments,
    quizComments,
    pollComments,
    hidden,
    deleted,
  ] = await Promise.all([
    db.comment.count({ where: notDeleted }),
    db.comment.count({ where: { ...notDeleted, targetType: 'ARTICLE' } }),
    db.comment.count({ where: { ...notDeleted, targetType: 'QUIZ' } }),
    db.comment.count({ where: { ...notDeleted, targetType: 'POLL' } }),
    db.comment.count({ where: { ...notDeleted, status: 'HIDDEN' } }),
    db.comment.count({ where: { deletedAt: { not: null } } }),
  ]);
  return { total, articleComments, quizComments, pollComments, hidden, deleted };
}

export async function getAnalyticsOverviewStats() {
  const today = startOfToday();
  const [
    dailyViews,
    articleViews,
    videoViews,
    quizAttempts,
    pollVotes,
    activeQuizzes,
    activePolls,
    userStats,
  ] = await Promise.all([
    db.articleView.count({ where: { viewedAt: { gte: today } } }),
    db.article.aggregate({ _sum: { viewCount: true } }),
    db.video.aggregate({ _sum: { viewCount: true } }),
    db.quizAttempt.count(),
    db.pollVote.count(),
    db.quiz.count({ where: { status: 'ACTIVE' } }),
    db.poll.count({ where: { status: 'ACTIVE' } }),
    getUsersStats(),
  ]);
  return {
    dailyViews,
    lifetimeViews:
      (articleViews._sum.viewCount ?? 0) + (videoViews._sum.viewCount ?? 0),
    quizAttempts,
    pollVotes,
    activeQuizzes,
    activePolls,
    totalUsers: userStats.total,
    activeUsers: userStats.active,
  };
}

export async function getArticlesMissingCategoryCount() {
  return db.article.count({
    where: {
      status: { in: [...ADMIN_LIST_ARTICLE_STATUSES] },
      categoryId: null,
    },
  });
}
