import { db } from "@/lib/db";
import { fetchLeaderboard } from "@/lib/leaderboard/queries";
import type {
  HomeEngagementResponse,
  HomeLeaderboardEntry,
} from "@/lib/home/types";

type PollRow = {
  id: string;
  title: string;
  slug: string;
  pollType: string;
  questions: Array<{
    options: Array<{ voteCount: number }>;
  }>;
};

type QuizRow = {
  id: string;
  title: string;
  slug: string;
  _count: { questions: number };
};

async function fetchLeaderboardData(): Promise<HomeLeaderboardEntry[]> {
  const { items, period, periodLabel } = await fetchLeaderboard("weekly", 10);
  return items.map((entry) => ({
    rank: entry.rank,
    userId: entry.userId,
    displayName: entry.displayName,
    username: entry.username,
    avatarUrl: entry.avatarUrl,
    periodPoints: entry.periodPoints,
    totalPoints: entry.totalPoints,
    period,
    periodLabel,
  }));
}

export async function fetchHomeEngagement(): Promise<HomeEngagementResponse> {
  const [polls, quizzes, leaderboard] = await Promise.all([
    db.poll.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        questions: {
          include: { options: { select: { voteCount: true } } },
        },
      },
    }),
    db.quiz.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { _count: { select: { questions: true } } },
    }),
    fetchLeaderboardData(),
  ]);

  return {
    polls: polls.map((poll: PollRow) => ({
      id: poll.id,
      title: poll.title,
      slug: poll.slug,
      pollType: poll.pollType,
      questionCount: poll.questions.length,
      totalVotes: poll.questions.reduce(
        (sum, q) =>
          sum + q.options.reduce((s, o) => s + o.voteCount, 0),
        0,
      ),
    })),
    quizzes: quizzes.map((quiz: QuizRow) => ({
      id: quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      questionCount: quiz._count.questions,
    })),
    leaderboard,
    leaderboardPeriod: "weekly",
    leaderboardPeriodLabel: "Minggu ini",
  };
}
