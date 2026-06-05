import { NextRequest, NextResponse } from 'next/server';
import { captureException } from '@/lib/monitoring';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { awardPoints } from '@/lib/points';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const blockedResponse = enforceRateLimit(request, 'poll-vote', {
      max: 6,
      windowMs: 60_000,
      message: 'Too many vote attempts. Please slow down.',
      identifier: user.id,
    });

    if (blockedResponse) {
      return blockedResponse;
    }

    const { slug } = await params;

  const poll = await db.poll.findUnique({ where: { slug } });
  if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
  if (poll.status !== 'ACTIVE')
    return NextResponse.json({ error: 'Poll is not active' }, { status: 400 });

  const body = await request.json();
  // votes: [{ questionId, optionId }]
  const { votes } = body as { votes: { questionId: string; optionId: string }[] };

  if (!Array.isArray(votes) || votes.length === 0)
    return NextResponse.json({ error: 'votes array is required' }, { status: 400 });

  // Cek apakah user sudah vote di salah satu pertanyaan ini
  const questionIds = votes.map((v) => v.questionId);
  const existingVotes = await db.pollVote.findMany({
    where: { pollId: poll.id, userId: user.id, questionId: { in: questionIds } },
  });
  const alreadyVotedQuestions = new Set(existingVotes.map((v) => v.questionId));

  const toProcess = votes.filter((v) => !alreadyVotedQuestions.has(v.questionId));
  if (toProcess.length === 0)
    return NextResponse.json({ error: 'You have already voted on all questions' }, { status: 400 });

  // Validasi opsi dan simpan vote
  for (const v of toProcess) {
    const option = await db.pollOption.findFirst({
      where: { id: v.optionId, questionId: v.questionId },
    });
    if (!option)
      return NextResponse.json(
        { error: `Invalid option ${v.optionId} for question ${v.questionId}` },
        { status: 400 },
      );

    await db.pollVote.create({
      data: {
        pollId: poll.id,
        questionId: v.questionId,
        optionId: v.optionId,
        userId: user.id,
        pointsAwarded: poll.pointsReward,
        isPointAwarded: true,
      },
    });

    await db.pollOption.update({
      where: { id: v.optionId },
      data: { voteCount: { increment: 1 } },
    });
  }

  // Award poin hanya sekali per poll (saat pertama kali vote)
  const wasFirstVote = existingVotes.length === 0;
  if (wasFirstVote) {
    await awardPoints(
      user.id,
      'poll_voted',
      'poll',
      poll.id,
      poll.pointsReward,
      `Voted in poll: ${poll.title}`,
    );
  }

  return NextResponse.json({
    message: 'Vote recorded',
    pointsAwarded: wasFirstVote ? poll.pointsReward : 0,
  });
  } catch (e: unknown) {
    await captureException(e, { route: 'poll-vote' });
    const message = e instanceof Error ? e.message : 'Vote failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
