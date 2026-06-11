import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { isCoreApiConfigured } from '@/lib/core/config';
import { fetchCoreLeaderboard } from '@/lib/core/users';

// Type definitions
interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  totalXp: number;
  currentPoints: number;
  period: 'all-time';
}

interface PollResponse {
  id: string;
  title: string;
  slug: string;
  pollType: string;
  questionCount: number;
  totalVotes: number;
}

interface QuizResponse {
  id: string;
  title: string;
  slug: string;
  questionCount: number;
}

interface PollPayload {
  id: string;
  title: string;
  slug: string;
  pollType: string;
  questions: Array<{
    options: Array<{
      voteCount: number;
    }>;
  }>;
}

interface QuizPayload {
  id: string;
  title: string;
  slug: string;
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

async function fetchLeaderboardData(): Promise<LeaderboardEntry[]> {
  if (!isCoreApiConfigured()) return [];

  try {
    const { items } = await fetchCoreLeaderboard(10, 0);
    return Promise.all(
      items.map(async (entry) => {
        const user = await db.user.findUnique({
          where: { id: entry.id },
          select: { name: true, username: true, avatarUrl: true },
        });
        const profile = await db.userProfile.findUnique({
          where: { userId: entry.id },
          select: { displayName: true },
        });
        return {
          rank: entry.rank,
          userId: entry.id,
          displayName: profile?.displayName || user?.name || entry.name,
          username: user?.username || '',
          avatarUrl: user?.avatarUrl || entry.imageUrl,
          totalXp: entry.totalXp,
          currentPoints: entry.currentPoints,
          period: 'all-time' as const,
        };
      }),
    );
  } catch {
    return [];
  }
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
  const [featuredArticles, articles, trending, polls, quizzes, categories] = await Promise.all([
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
      take: 4,
      include: { _count: { select: { questions: true } } },
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  const leaderboardData = await fetchLeaderboardData();
  const categoriesWithArticles = await fetchCategoriesWithArticles(categories);

  const response: HomepageResponse = {
    featuredArticles,
    articles,
    trending,
    polls: polls.map((poll: PollPayload) => ({
      id: poll.id,
      title: poll.title,
      slug: poll.slug,
      pollType: poll.pollType,
      questionCount: poll.questions.length,
      totalVotes: poll.questions.reduce(
        (sum: number, q: typeof poll.questions[number]) =>
          sum + q.options.reduce((s: number, o: typeof q.options[number]) => s + o.voteCount, 0),
        0
      ),
    })),
    quizzes: quizzes.map((quiz: QuizPayload) => ({
      id: quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      questionCount: quiz._count.questions,
    })),
    leaderboard: leaderboardData,
    categories: categoriesWithArticles,
  };

  return NextResponse.json(response);
}

