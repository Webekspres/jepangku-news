import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditAdminEntity } from '@/lib/audit-routes';
import { createSlug } from '@/lib/slug';
import {
  sanitizeMediaUrl,
  sanitizePlainField,
  sanitizeQuestionBundle,
} from '@/lib/sanitizer';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const where: any = {};
  if (status) where.status = status.toUpperCase();

  const quizzes = await db.quiz.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      title: true,
      slug: true,
      quizType: true,
      status: true,
      pointsReward: true,
      correctAnswerPoints: true,
      allowRetry: true,
      createdAt: true,
      _count: {
        select: { questions: true, attempts: true },
      },
    },
  });

  return apiSuccess(quizzes);
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const body = await request.json();
  const {
    title,
    description,
    thumbnailUrl,
    quizType = 'trivia',
    status = 'ACTIVE',
    pointsReward = 10,
    correctAnswerPoints = 5,
    allowRetry = false,
    showResultImmediately = true,
    questions = [],
  } = body;

  const safeTitle = sanitizePlainField(title, 200);
  if (!safeTitle) return apiError('Title is required' , { status: 400 });

  const safeQuestions = Array.isArray(questions) ? sanitizeQuestionBundle(questions) : [];
  const slug = createSlug(safeTitle);

  const quiz = await db.quiz.create({
    data: {
      createdBy: admin.id,
      title: safeTitle,
      slug,
      description: description ? sanitizePlainField(description, 1000) : null,
      thumbnailUrl: sanitizeMediaUrl(thumbnailUrl),
      quizType,
      status: status.toUpperCase() as any,
      pointsReward: Number(pointsReward) || 10,
      correctAnswerPoints: Number(correctAnswerPoints) || 5,
      allowRetry: Boolean(allowRetry),
      showResultImmediately: Boolean(showResultImmediately),
    },
  });

  for (let i = 0; i < safeQuestions.length; i++) {
    const q = safeQuestions[i];
    const question = await db.quizQuestion.create({
      data: {
        quizId: quiz.id,
        questionText: q.questionText,
        imageUrl: q.imageUrl,
        sortOrder: q.sortOrder,
      },
    });

    for (let j = 0; j < q.options.length; j++) {
      const opt = q.options[j];
      await db.quizOption.create({
        data: {
          questionId: question.id,
          optionText: opt.optionText,
          imageUrl: opt.imageUrl,
          isCorrect: opt.isCorrect,
          sortOrder: opt.sortOrder,
        },
      });
    }
  }

  auditAdminEntity(admin, 'quiz', 'create', { type: 'quiz', id: quiz.id, label: quiz.title, href: `/admin/quizzes/${quiz.id}/edit` });

  return apiSuccess({ message: 'Quiz created', id: quiz.id }, { status: 201 });
}
