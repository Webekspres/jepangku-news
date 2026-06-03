import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
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

  // Hitung total votes dan persentase per opsi per pertanyaan
  const questionsWithStats = poll.questions.map((q) => {
    const totalVotes = q.options.reduce((sum, o) => sum + o.voteCount, 0);
    return {
      ...q,
      totalVotes,
      options: q.options.map((o) => ({
        ...o,
        percentage: totalVotes > 0 ? (o.voteCount / totalVotes) * 100 : 0,
      })),
    };
  });

  const totalVotesAll = questionsWithStats.reduce((sum, q) => sum + q.totalVotes, 0);

  return NextResponse.json({
    ...poll,
    questions: questionsWithStats,
    totalVotes: totalVotesAll,
  });
}
