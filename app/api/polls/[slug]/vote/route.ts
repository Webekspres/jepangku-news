import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { awardPoints } from '@/lib/points';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { slug } = await params;

  const poll = await db.poll.findUnique({ where: { slug } });
  if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

  const existing = await db.pollVote.findFirst({ where: { pollId: poll.id, userId: user.id } });
  if (existing) return NextResponse.json({ error: 'You have already voted' }, { status: 400 });

  const body = await request.json();
  const { option_id } = body;

  const option = await db.pollOption.findFirst({ where: { id: option_id, pollId: poll.id } });
  if (!option) return NextResponse.json({ error: 'Invalid option' }, { status: 400 });

  await db.pollVote.create({
    data: { pollId: poll.id, optionId: option_id, userId: user.id, pointsAwarded: 5 },
  });

  await db.pollOption.update({ where: { id: option_id }, data: { voteCount: { increment: 1 } } });

  await awardPoints(user.id, 'poll_joined', 'poll', poll.id, 5, `Voted in poll: ${poll.title}`);

  return NextResponse.json({ message: 'Vote recorded', pointsAwarded: 5 });
}
