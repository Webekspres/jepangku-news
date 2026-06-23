import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const quiz = await db.quiz.findUnique({
    where: { slug },
    include: {
      questions: {
        orderBy: { sortOrder: 'asc' },
        include: {
          options: {
            orderBy: { sortOrder: 'asc' },
            select: { id: true, optionText: true, imageUrl: true, sortOrder: true },
          },
        },
      },
    },
  });

  if (!quiz) return apiError('Quiz not found' , { status: 404 });

  const user = await getCurrentUser(request);
  let userAttempt = null;

  if (user) {
    userAttempt = await db.quizAttempt.findFirst({
      where: { quizId: quiz.id, userId: user.id },
      select: {
        id: true,
        score: true,
        correctAnswers: true,
        totalQuestions: true,
        pointsAwarded: true,
      },
    });
  }

  return apiSuccess({
    ...quiz,
    userAttempt,
    userHasCompleted: Boolean(userAttempt),
  });
}
