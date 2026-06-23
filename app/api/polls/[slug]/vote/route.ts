import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { captureException } from '@/lib/monitoring';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { gamificationFieldsFromAward } from '@/lib/gamification-response';
import { awardPoints, type AwardPointsResult } from '@/lib/points';
import { auditPollVote } from '@/lib/audit-routes';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return apiError('Not authenticated' , { status: 401 });

    const blockedResponse = await enforceRateLimit(request, 'poll-vote', {
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
  if (!poll) return apiError('Poll not found' , { status: 404 });
  if (poll.status !== 'ACTIVE')
    return apiError('Poll is not active' , { status: 400 });

  const body = await request.json();
  // votes: [{ questionId, optionId }]
  const { votes } = body as { votes: { questionId: string; optionId: string }[] };

  if (!Array.isArray(votes) || votes.length === 0)
    return apiError('votes array is required' , { status: 400 });

  // Cek apakah user sudah vote di salah satu pertanyaan ini
  const questionIds = votes.map((v) => v.questionId);
  const existingVotes = await db.pollVote.findMany({
    where: { pollId: poll.id, userId: user.id, questionId: { in: questionIds } },
  });
  const alreadyVotedQuestions = new Set(existingVotes.map((v) => v.questionId));

  const toProcess = votes.filter((v) => !alreadyVotedQuestions.has(v.questionId));
  if (toProcess.length === 0) {
    // Retry award bila vote sudah tercatat saat activity type belum ada di Core
    if (existingVotes.length > 0 && poll.pointsReward > 0) {
      const retry = await awardPoints(
        user.id,
        'poll_voted',
        'poll',
        poll.id,
        poll.pointsReward,
        `Voted in poll: ${poll.title}`,
      );
      if (retry.awarded) {
        await db.pollVote.updateMany({
          where: { pollId: poll.id, userId: user.id },
          data: { isPointAwarded: true },
        });
        return apiSuccess({
          message: 'Pending points awarded',
          pointsAwarded: poll.pointsReward,
          ...gamificationFieldsFromAward(retry),
        });
      }
    }
    return apiError('You have already voted on all questions' , { status: 400 });
  }

  // Award poin sekali per poll — sebelum simpan vote agar isPointAwarded akurat
  const wasFirstVote = existingVotes.length === 0;
  let award: AwardPointsResult = {
    awarded: false,
    currentPoints: null,
    totalXp: null,
    currentLevel: null,
  };
  if (wasFirstVote && poll.pointsReward > 0) {
    award = await awardPoints(
      user.id,
      'poll_voted',
      'poll',
      poll.id,
      poll.pointsReward,
      `Voted in poll: ${poll.title}`,
    );
  }
  const pointsGranted = award.awarded ? poll.pointsReward : 0;

  for (const v of toProcess) {
    const option = await db.pollOption.findFirst({
      where: { id: v.optionId, questionId: v.questionId },
    });
    if (!option)
      return apiSuccess(
        { error: `Invalid option ${v.optionId} for question ${v.questionId}` },
        { status: 400 },
      );

    await db.pollVote.create({
      data: {
        pollId: poll.id,
        questionId: v.questionId,
        optionId: v.optionId,
        userId: user.id,
        pointsAwarded: wasFirstVote ? poll.pointsReward : 0,
        isPointAwarded: pointsGranted > 0,
      },
    });

    await db.pollOption.update({
      where: { id: v.optionId },
      data: { voteCount: { increment: 1 } },
    });
  }

  auditPollVote(user, poll, toProcess.length);

  return apiSuccess({
    message: 'Vote recorded',
    pointsAwarded: pointsGranted,
    ...gamificationFieldsFromAward(award),
  });
  } catch (e: unknown) {
    await captureException(e, { route: 'poll-vote' });
    const message = e instanceof Error ? e.message : 'Vote failed';
    return apiError(message , { status: 500 });
  }
}
