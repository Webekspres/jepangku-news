import { db } from '@/lib/db';
import { getJakartaMonthBounds } from '@/lib/leaderboard/period';
import { fallbackUsernameFromCoreUser } from '@/lib/username';

export type QuizLeaderboardPeriod = 'monthly' | 'sepanjang-waktu';

export type QuizLeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  submittedAt: string;
};

export function parseQuizLeaderboardPeriod(
  value: string | null,
): QuizLeaderboardPeriod {
  return value === 'monthly' ? 'monthly' : 'sepanjang-waktu';
}

export async function getQuizLeaderboard(
  quizId: string,
  period: QuizLeaderboardPeriod,
  limit = 20,
): Promise<QuizLeaderboardEntry[]> {
  const bounds =
    period === 'monthly' ? getJakartaMonthBounds() : null;

  type Row = {
    user_id: string;
    score: number;
    correct_answers: number;
    total_questions: number;
    submitted_at: Date;
  };

  const rows = bounds
    ? await db.$queryRaw<Row[]>`
        SELECT DISTINCT ON (qa.user_id)
          qa.user_id,
          qa.score,
          qa.correct_answers,
          qa.total_questions,
          qa.submitted_at
        FROM quiz_attempts qa
        INNER JOIN users u ON u.id = qa.user_id
        WHERE qa.quiz_id = ${quizId}
          AND u.status = 'active'
          AND qa.submitted_at >= ${bounds.start}
          AND qa.submitted_at <= ${bounds.end}
        ORDER BY qa.user_id, qa.score DESC, qa.submitted_at ASC
      `
    : await db.$queryRaw<Row[]>`
        SELECT DISTINCT ON (qa.user_id)
          qa.user_id,
          qa.score,
          qa.correct_answers,
          qa.total_questions,
          qa.submitted_at
        FROM quiz_attempts qa
        INNER JOIN users u ON u.id = qa.user_id
        WHERE qa.quiz_id = ${quizId}
          AND u.status = 'active'
        ORDER BY qa.user_id, qa.score DESC, qa.submitted_at ASC
      `;

  const sorted = rows
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.submitted_at.getTime() - b.submitted_at.getTime();
    })
    .slice(0, limit);

  if (sorted.length === 0) return [];

  const users = await db.user.findMany({
    where: { id: { in: sorted.map((r) => r.user_id) } },
    select: { id: true, name: true, username: true, avatarUrl: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return sorted.map((row, index) => {
    const user = userMap.get(row.user_id);
    return {
      rank: index + 1,
      userId: row.user_id,
      name: user?.name ?? 'User',
      username:
        user?.username ??
        fallbackUsernameFromCoreUser({
          id: row.user_id,
          name: user?.name ?? 'user',
        }),
      avatarUrl: user?.avatarUrl ?? null,
      score: Number(row.score),
      correctAnswers: row.correct_answers,
      totalQuestions: row.total_questions,
      submittedAt: row.submitted_at.toISOString(),
    };
  });
}
