import { db } from "@/lib/db";
import { fetchLeaderboard } from "@/lib/leaderboard/queries";
import { fetchHomeTv } from "@/lib/home/queries/tv";
import {
  homeArticleInclude,
  publishedArticleWhere,
} from "@/lib/home/article-include";
import type {
  ExplorePollPreview,
  ExploreQuizPreview,
  ExploreResponse,
} from "@/lib/explore/types";

const TRENDING_LIMIT = 6;
const POLL_LIMIT = 3;
const QUIZ_LIMIT = 3;
const VIDEO_SIDEBAR_LIMIT = 6;
const LEADERBOARD_LIMIT = 5;

async function fetchExplorePolls(): Promise<ExplorePollPreview[]> {
  const polls = await db.poll.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: POLL_LIMIT,
    include: {
      questions: {
        include: { options: { select: { voteCount: true } } },
      },
    },
  });

  return polls.map((poll) => ({
    id: poll.id,
    title: poll.title,
    slug: poll.slug,
    pollType: poll.pollType,
    questionCount: poll.questions.length,
    totalVotes: poll.questions.reduce(
      (sum, q) => sum + q.options.reduce((s, o) => s + o.voteCount, 0),
      0,
    ),
    thumbnailUrl: poll.thumbnailUrl,
    description: poll.description,
  }));
}

async function fetchExploreQuizzes(): Promise<ExploreQuizPreview[]> {
  const quizzes = await db.quiz.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: QUIZ_LIMIT,
    include: { _count: { select: { questions: true } } },
  });

  return quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    slug: quiz.slug,
    questionCount: quiz._count.questions,
    thumbnailUrl: quiz.thumbnailUrl,
    description: quiz.description,
  }));
}

export async function fetchExploreContent(): Promise<ExploreResponse> {
  const [trendingArticles, polls, quizzes, tv, categories, leaderboardData] =
    await Promise.all([
      db.article.findMany({
        where: publishedArticleWhere,
        orderBy: { weeklyViewCount: "desc" },
        take: TRENDING_LIMIT,
        include: homeArticleInclude,
      }),
      fetchExplorePolls(),
      fetchExploreQuizzes(),
      fetchHomeTv(),
      db.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      }),
      fetchLeaderboard("weekly", LEADERBOARD_LIMIT),
    ]);

  const sidebarVideos = tv.sidebarVideos.slice(0, VIDEO_SIDEBAR_LIMIT);

  return {
    trendingArticles,
    polls,
    quizzes,
    featuredVideo: tv.featuredVideo,
    videos: sidebarVideos,
    leaderboard: leaderboardData.items.map((entry) => ({
      rank: entry.rank,
      userId: entry.userId,
      displayName: entry.displayName,
      username: entry.username,
      avatarUrl: entry.avatarUrl,
      periodPoints: entry.periodPoints,
      totalPoints: entry.totalPoints,
      period: leaderboardData.period,
      periodLabel: leaderboardData.periodLabel,
    })),
    leaderboardPeriodLabel: leaderboardData.periodLabel,
    categories,
  };
}
