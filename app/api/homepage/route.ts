import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Type definitions
interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  weeklyPoints: number;
}

interface PollResponse {
  id: string;
  questionCount: number;
  totalVotes: number;
}

interface QuizResponse {
  id: string;
  questionCount: number;
}

interface PollPayload {
  id: string;
  questions: Array<{
    options: Array<{
      voteCount: number;
    }>;
  }>;
}

interface QuizPayload {
  id: string;
  _count: {
    questions: number;
  };
}

interface CategoryWithArticles {
  id: string;
  name: string;
  slug: string;
  articles: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
}

interface HomepageResponse {
  featuredArticles: Prisma.ArticleGetPayload<{
    include: { author: { select: { name: true; username: true } }; category: { select: { name: true; slug: true } } };
  }>[];
  articles: Prisma.ArticleGetPayload<{
    include: { author: { select: { name: true; username: true } }; category: { select: { name: true; slug: true } } };
  }>[];
  trending: Prisma.ArticleGetPayload<{
    include: { author: { select: { name: true; username: true } }; category: { select: { name: true; slug: true } } };
  }>[];
  polls: PollResponse[];
  quizzes: QuizResponse[];
  leaderboard: LeaderboardEntry[];
  categories: CategoryWithArticles[];
}

// Helper function to fetch leaderboard data
async function fetchLeaderboardData(
  leaderboard: Array<{ userId: string; _sum: { points: number | null } }>
): Promise<LeaderboardEntry[]> {
  return Promise.all(
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
}

// Helper function to fetch categories with articles
async function fetchCategoriesWithArticles(
  categories: Array<{ id: string; name: string; slug: string }>
): Promise<CategoryWithArticles[]> {
  return Promise.all(
    categories.map(async (cat) => {
      const categoryArticles = await db.article.findMany({
        where: { categoryId: cat.id, status: 'PUBLISHED', visibility: 'public' },
        orderBy: { publishedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true },
      });

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        articles: categoryArticles,
      };
    })
  );
}

export async function GET(): Promise<NextResponse<HomepageResponse>> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [featuredArticles, articles, trending, polls, quizzes, leaderboard, categories] = await Promise.all([
    db.article.findMany({
      where: { isFeatured: true, status: 'PUBLISHED', visibility: 'public' },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: { select: { name: true, username: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    db.article.findMany({
      where: { status: 'PUBLISHED', visibility: 'public', NOT: { isFeatured: true } },
      orderBy: { publishedAt: 'desc' },
      take: 7,
      include: {
        author: { select: { name: true, username: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    db.article.findMany({
      where: { status: 'PUBLISHED', visibility: 'public' },
      orderBy: { weeklyViewCount: 'desc' },
      take: 5,
      include: {
        author: { select: { name: true, username: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    db.poll.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        questions: {
          include: { options: { select: { voteCount: true } } },
        },
      },
    }),
    db.quiz.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { questions: true } } },
    }),
    db.pointTransaction.groupBy({
      by: ['userId'],
      where: { sourceApp: 'news', occurredAt: { gte: sevenDaysAgo } },
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: 10,
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  const leaderboardData = await fetchLeaderboardData(leaderboard);
  const categoriesWithArticles = await fetchCategoriesWithArticles(categories);

  const response: HomepageResponse = {
    featuredArticles,
    articles,
    trending,
    polls: polls.map((poll: PollPayload) => ({
      id: poll.id,
      questionCount: poll.questions.length,
      totalVotes: poll.questions.reduce(
        (sum: number, q: typeof poll.questions[number]) =>
          sum + q.options.reduce((s: number, o: typeof q.options[number]) => s + o.voteCount, 0),
        0
      ),
    })),
    quizzes: quizzes.map((quiz: QuizPayload) => ({
      id: quiz.id,
      questionCount: quiz._count.questions,
    })),
    leaderboard: leaderboardData,
    categories: categoriesWithArticles,
  };

  return NextResponse.json(response);
}

