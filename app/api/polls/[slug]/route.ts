import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const poll = await db.poll.findUnique({
    where: { slug },
    include: {
      questions: {
        orderBy: { sortOrder: 'asc' },
        include: {
          options: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
  });

  if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

  const user = await getCurrentUser(request);
  const userVotesByQuestion = new Map<string, string>();

  if (user) {
    const userVotes = await db.pollVote.findMany({
      where: { pollId: poll.id, userId: user.id },
      select: { questionId: true, optionId: true },
    });
    for (const vote of userVotes) {
      userVotesByQuestion.set(vote.questionId, vote.optionId);
    }
  }

  // Hitung total votes dan persentase per opsi per pertanyaan
  const questionsWithStats = poll.questions.map((q) => {
    const totalVotes = q.options.reduce((sum, o) => sum + o.voteCount, 0);
    return {
      ...q,
      totalVotes,
      userOptionId: userVotesByQuestion.get(q.id) ?? null,
      options: q.options.map((o) => ({
        ...o,
        percentage: totalVotes > 0 ? (o.voteCount / totalVotes) * 100 : 0,
      })),
    };
  });

  const totalVotesAll = questionsWithStats.reduce((sum, q) => sum + q.totalVotes, 0);
  const userVotedQuestionIds = questionsWithStats
    .filter((q) => q.userOptionId)
    .map((q) => q.id);
  const userHasCompleted =
    poll.questions.length > 0 &&
    poll.questions.every((q) => userVotesByQuestion.has(q.id));

  return NextResponse.json({
    ...poll,
    questions: questionsWithStats,
    totalVotes: totalVotesAll,
    userVotedQuestionIds,
    userHasCompleted,
  });
}
