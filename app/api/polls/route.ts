import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'ACTIVE';

  const polls = await db.poll.findMany({
    where: { status: status.toUpperCase() as any },
    orderBy: { createdAt: 'desc' },
    include: { options: { orderBy: { sortOrder: 'asc' } } },
  });

  return NextResponse.json(
    polls.map((p: typeof polls[number]) => ({
      ...p,
      totalVotes: p.options.reduce((sum: number, o: { voteCount: number }) => sum + o.voteCount, 0),
    }))
  );
}
