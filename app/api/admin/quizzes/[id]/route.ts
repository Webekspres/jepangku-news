import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

/* ── GET /api/admin/quizzes/[id] ── */
export async function GET(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  const quiz = await db.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { sortOrder: 'asc' },
        include: {
          options: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
  });

  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

  return NextResponse.json(quiz);
}

/* ── PATCH /api/admin/quizzes/[id] ── */
export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  const quiz = await db.quiz.findUnique({ where: { id } });
  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

  const body = await request.json();
  const {
    title,
    description,
    thumbnailUrl,
    quizType,
    status,
    pointsReward,
    correctAnswerPoints,
    allowRetry,
    showResultImmediately,
    questions,
  } = body;

  if (title !== undefined && !title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  // Build partial update — hanya field yang dikirim
  const updateData: any = {};
  if (title !== undefined)                updateData.title = title.trim();
  if (description !== undefined)          updateData.description = description || null;
  if (thumbnailUrl !== undefined)         updateData.thumbnailUrl = thumbnailUrl || null;
  if (quizType !== undefined)             updateData.quizType = quizType;
  if (status !== undefined)              updateData.status = status.toUpperCase();
  if (pointsReward !== undefined)        updateData.pointsReward = Number(pointsReward);
  if (correctAnswerPoints !== undefined) updateData.correctAnswerPoints = Number(correctAnswerPoints);
  if (allowRetry !== undefined)          updateData.allowRetry = Boolean(allowRetry);
  if (showResultImmediately !== undefined) updateData.showResultImmediately = Boolean(showResultImmediately);

  // Update quiz metadata
  await db.quiz.update({ where: { id }, data: updateData });

  // Replace questions if provided
  if (Array.isArray(questions)) {
    // Delete all existing questions (cascade deletes options)
    await db.quizQuestion.deleteMany({ where: { quizId: id } });

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const question = await db.quizQuestion.create({
        data: {
          quizId: id,
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
  }

  return NextResponse.json({ message: 'Quiz updated' });
}

/* ── DELETE /api/admin/quizzes/[id] ── */
export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  const quiz = await db.quiz.findUnique({ where: { id } });
  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

  if (quiz.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Hanya kuis berstatus Draft yang dapat dihapus' }, { status: 400 });
  }

  await db.quiz.delete({ where: { id } });

  return NextResponse.json({ message: 'Quiz deleted' });
}
