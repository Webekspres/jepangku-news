import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSlug } from '@/lib/slug';

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

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

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const slug = createSlug(title);

  const quiz = await db.quiz.create({
    data: {
      createdBy: admin.id,
      title,
      slug,
      description: description || null,
      thumbnailUrl: thumbnailUrl || null,
      quizType,
      status: status.toUpperCase() as any,
      pointsReward: Number(pointsReward) || 10,
      correctAnswerPoints: Number(correctAnswerPoints) || 5,
      allowRetry: Boolean(allowRetry),
      showResultImmediately: Boolean(showResultImmediately),
    },
  });

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const question = await db.quizQuestion.create({
      data: {
        quizId: quiz.id,
        questionText: q.question_text,
        imageUrl: q.image_url || null,
        sortOrder: q.sort_order ?? i,
      },
    });

    for (let j = 0; j < (q.options || []).length; j++) {
      const opt = q.options[j];
      await db.quizOption.create({
        data: {
          questionId: question.id,
          optionText: opt.option_text,
          imageUrl: opt.image_url || null,
          isCorrect: opt.is_correct || false,
          sortOrder: opt.sort_order ?? j,
        },
      });
    }
  }

  return NextResponse.json({ message: 'Quiz created', id: quiz.id }, { status: 201 });
}
