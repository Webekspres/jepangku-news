import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const poll = await db.poll.findUnique({
    where: { slug },
    include: { options: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

  const totalVotes = poll.options.reduce((sum: number, o: { voteCount: number }) => sum + o.voteCount, 0);

  return NextResponse.json({
    ...poll,
    totalVotes,
    options: poll.options.map((o: typeof poll.options[number]) => ({
      ...o,
      percentage: totalVotes > 0 ? (o.voteCount / totalVotes) * 100 : 0,
    })),
  });
}
