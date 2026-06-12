import { db } from "@/lib/db";
import { isCoreApiConfigured } from "@/lib/core/config";
import { fetchCoreLeaderboard } from "@/lib/core/users";
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
          username: user?.username || "",
          avatarUrl: user?.avatarUrl || entry.imageUrl,
          totalXp: entry.totalXp,
          currentPoints: entry.currentPoints,
          period: "all-time" as const,
        };
      }),
    );
  } catch {
    return [];
  }
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
  };
}
