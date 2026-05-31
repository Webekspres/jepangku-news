import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const [articles, trending, polls, quizzes, leaderboard, categories] = await Promise.all([
    db.article.findMany({
      where: { status: 'PUBLISHED', visibility: 'public' },
      orderBy: { publishedAt: 'desc' },
      take: 7,
      include: {
        author: { select: { name: true, username: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    db.article.findMany({
      where: { status: 'PUBLISHED', visibility: 'public' },
      orderBy: { viewCount: 'desc' },
      take: 4,
      include: {
        author: { select: { name: true, username: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    db.poll.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { options: { orderBy: { sortOrder: 'asc' } } },
    }),
    db.quiz.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { questions: true } } },
    }),
    db.pointTransaction.groupBy({
      by: ['userId'],
      where: { sourceApp: 'news', occurredAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } },
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: 10,
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  const leaderboardData = await Promise.all(
    leaderboard.map(async (entry, idx) => {
      const user = await db.user.findUnique({
        where: { id: entry.userId },
        select: { name: true, username: true, avatarUrl: true },
      });
      const profile = await db.userProfile.findUnique({
        where: { userId: entry.userId },
        select: { displayName: true },
      });
      return {
        rank: idx + 1,
        userId: entry.userId,
        displayName: profile?.displayName || user?.name || 'Unknown',
        username: user?.username || '',
        avatarUrl: user?.avatarUrl || null,
        weeklyPoints: entry._sum.points || 0,
      };
    })
  );

  return NextResponse.json({
    articles,
    trending,
    polls: polls.map((poll) => ({
      ...poll,
      totalVotes: poll.options.reduce((sum, option) => sum + option.voteCount, 0),
    })),
    quizzes: quizzes.map((quiz) => ({
      ...quiz,
      questionCount: quiz._count.questions,
    })),
    leaderboard: leaderboardData,
    categories,
  });
}
