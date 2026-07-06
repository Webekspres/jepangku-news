import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { gamificationFieldsFromAward } from '@/lib/gamification-response';
import { awardPoints } from '@/lib/points';
import { enforceRateLimit } from '@/lib/rate-limit';
import { captureException } from '@/lib/monitoring';
import { auditQuizAttempt } from '@/lib/audit-routes';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
  const user = await getCurrentUser(request);
  if (!user) return apiError('Not authenticated' , { status: 401 });

  const { slug } = await params;

  const blocked = await enforceRateLimit(request, 'quiz-attempt', {
    max: 5,
    windowMs: 60_000,
    identifier: user.id,
    message: 'Terlalu banyak percobaan kuis. Coba lagi sebentar.',
  });
  if (blocked) {
    logger.warn('quiz.attempt.rate_limited', { userId: user.id, slug });
    return blocked;
  }

  const quiz = await db.quiz.findUnique({
    where: { slug },
    include: { questions: { include: { options: true } } },
  });
  if (!quiz) return apiError('Quiz not found' , { status: 404 });

  const existingAttempt = await db.quizAttempt.findFirst({
    where: { quizId: quiz.id, userId: user.id },
  });
  if (existingAttempt) {
    logger.warn('quiz.attempt.duplicate', { userId: user.id, slug, existingAttemptId: existingAttempt.id });
    return apiError('You have already attempted this quiz' , { status: 400 });
  }

  const body = await request.json();
  const { answers } = body;

  const totalQuestions = quiz.questions.length;
  let correctAnswers = 0;

  // Create attempt first
  const attempt = await db.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId: user.id,
      score: 0,
      totalQuestions,
      correctAnswers: 0,
      pointsAwarded: 0,
      startedAt: new Date(),
      submittedAt: new Date(),
    },
  });

  // Process answers
  for (const answer of answers) {
    const { question_id, selected_option_id } = answer;
    const option = await db.quizOption.findUnique({ where: { id: selected_option_id } });
    const isCorrect = option?.isCorrect ?? false;
    if (isCorrect) correctAnswers++;

    await db.quizAttemptAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: question_id,
        selectedOptionId: selected_option_id,
        isCorrect,
      },
    });
  }

  const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const basePoints = quiz.pointsReward;
  const correctPoints = quiz.correctAnswerPoints * correctAnswers;
  const _totalPoints = basePoints + correctPoints;

  let lastAward = await awardPoints(
    user.id,
    'quiz_completed',
    'quiz',
    quiz.id,
    basePoints,
    `Completed quiz: ${quiz.title}`,
  );
  let pointsGranted = lastAward.awarded ? basePoints : 0;

  if (correctAnswers > 0) {
    const correctAward = await awardPoints(
      user.id,
      'quiz_correct_answers',
      'quiz',
      quiz.id,
      correctPoints,
      `${correctAnswers} correct answers in quiz: ${quiz.title}`,
    );
    lastAward = correctAward;
    if (correctAward.awarded) pointsGranted += correctPoints;
  }

  await db.quizAttempt.update({
    where: { id: attempt.id },
    data: { score, correctAnswers, pointsAwarded: pointsGranted },
  });

  auditQuizAttempt(user, quiz, {
    correct: correctAnswers,
    total: totalQuestions,
    points: pointsGranted,
  });

  logger.info('quiz.attempt.completed', {
    userId: user.id,
    quizId: quiz.id,
    slug,
    attemptId: attempt.id,
    score: Math.round(score),
    correctAnswers,
    totalQuestions,
    pointsAwarded: pointsGranted,
  });

  return apiSuccess({
    attemptId: attempt.id,
    score,
    correctAnswers,
    totalQuestions,
    pointsAwarded: pointsGranted,
    ...gamificationFieldsFromAward(lastAward),
  });
  } catch (e) {
    await captureException(e, { route: 'quiz-attempt' });
    return apiError('Failed to submit quiz' , { status: 500 });
  }
}
