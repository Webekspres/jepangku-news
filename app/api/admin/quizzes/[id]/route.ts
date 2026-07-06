import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { auditAdminEntity } from '@/lib/audit-routes';
import { db } from '@/lib/db';
import {
  sanitizeMediaUrl,
  sanitizePlainField,
  sanitizeQuestionBundle,
} from '@/lib/sanitizer';

type Params = { params: Promise<{ id: string }> };

/* ── GET /api/admin/quizzes/[id] ── */
export async function GET(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

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

  if (!quiz) return apiError('Quiz not found' , { status: 404 });

  return apiSuccess(quiz);
}

/* ── PATCH /api/admin/quizzes/[id] ── */
export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;

  const quiz = await db.quiz.findUnique({ where: { id } });
  if (!quiz) return apiError('Quiz not found' , { status: 404 });

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
    return apiError('Title is required' , { status: 400 });
  }

  // Build partial update — hanya field yang dikirim
  const updateData: any = {};
  if (title !== undefined)                updateData.title = sanitizePlainField(title, 200);
  if (description !== undefined)          updateData.description = description ? sanitizePlainField(description, 1000) : null;
  if (thumbnailUrl !== undefined)         updateData.thumbnailUrl = sanitizeMediaUrl(thumbnailUrl);
  if (quizType !== undefined)             updateData.quizType = quizType;
  if (status !== undefined)              updateData.status = status.toUpperCase();
  if (pointsReward !== undefined)        updateData.pointsReward = Number(pointsReward);
  if (correctAnswerPoints !== undefined) updateData.correctAnswerPoints = Number(correctAnswerPoints);
  if (allowRetry !== undefined)          updateData.allowRetry = Boolean(allowRetry);
  if (showResultImmediately !== undefined) updateData.showResultImmediately = Boolean(showResultImmediately);

  // Update quiz metadata
  await db.quiz.update({ where: { id }, data: updateData });

  // Sinkronkan pertanyaan secara in-place (update by id) agar jawaban peserta
  // yang sudah masuk tidak ikut ter-reset. Pertanyaan/opsi yang sudah memiliki
  // jawaban tidak boleh dihapus.
  if (Array.isArray(questions)) {
    const safeQuestions = sanitizeQuestionBundle(questions);

    const existingQuestions = await db.quizQuestion.findMany({
      where: { quizId: id },
      include: {
        _count: { select: { answers: true } },
        options: { select: { id: true, _count: { select: { answers: true } } } },
      },
    });

    const incomingQuestionIds = new Set(
      safeQuestions.map((q) => q.id).filter((qid): qid is string => Boolean(qid)),
    );
    const incomingOptionIds = new Set(
      safeQuestions
        .flatMap((q) => q.options.map((o) => o.id))
        .filter((oid): oid is string => Boolean(oid)),
    );

    // Guard: pertanyaan ber-jawaban tidak boleh dihapus
    const removedQuestions = existingQuestions.filter(
      (q) => !incomingQuestionIds.has(q.id),
    );
    if (removedQuestions.some((q) => q._count.answers > 0)) {
      return apiError(
        'Pertanyaan yang sudah dijawab peserta tidak dapat dihapus. Anda tetap bisa memperbaiki teks atau gambarnya.',
        { status: 400 },
      );
    }

    // Guard: opsi ber-jawaban tidak boleh dihapus
    for (const q of existingQuestions) {
      for (const o of q.options) {
        if (o._count.answers > 0 && !incomingOptionIds.has(o.id)) {
          return apiError(
            'Opsi jawaban yang sudah dipilih peserta tidak dapat dihapus. Anda tetap bisa memperbaiki teks atau gambarnya.',
            { status: 400 },
          );
        }
      }
    }

    await db.$transaction(async (tx) => {
      if (removedQuestions.length > 0) {
        await tx.quizQuestion.deleteMany({
          where: { id: { in: removedQuestions.map((q) => q.id) } },
        });
      }

      for (const q of safeQuestions) {
        const existing = q.id
          ? existingQuestions.find((eq) => eq.id === q.id)
          : undefined;

        let questionId: string;
        if (existing) {
          await tx.quizQuestion.update({
            where: { id: existing.id },
            data: {
              questionText: q.questionText,
              imageUrl: q.imageUrl,
              sortOrder: q.sortOrder,
            },
          });
          questionId = existing.id;
        } else {
          const created = await tx.quizQuestion.create({
            data: {
              quizId: id,
              questionText: q.questionText,
              imageUrl: q.imageUrl,
              sortOrder: q.sortOrder,
            },
          });
          questionId = created.id;
        }

        const existingOptions = existing?.options ?? [];
        const keptOptionIds = new Set(
          q.options.map((o) => o.id).filter((oid): oid is string => Boolean(oid)),
        );
        const removedOptions = existingOptions.filter(
          (o) => !keptOptionIds.has(o.id),
        );
        if (removedOptions.length > 0) {
          await tx.quizOption.deleteMany({
            where: { id: { in: removedOptions.map((o) => o.id) } },
          });
        }

        for (const opt of q.options) {
          const existingOption = opt.id
            ? existingOptions.find((eo) => eo.id === opt.id)
            : undefined;
          if (existingOption) {
            await tx.quizOption.update({
              where: { id: existingOption.id },
              data: {
                optionText: opt.optionText,
                imageUrl: opt.imageUrl,
                isCorrect: opt.isCorrect,
                sortOrder: opt.sortOrder,
              },
            });
          } else {
            await tx.quizOption.create({
              data: {
                questionId,
                optionText: opt.optionText,
                imageUrl: opt.imageUrl,
                isCorrect: opt.isCorrect,
                sortOrder: opt.sortOrder,
              },
            });
          }
        }
      }
    });
  }

  auditAdminEntity(admin, 'quiz', 'update', {
    type: 'quiz',
    id,
    label: (updateData.title as string | undefined) ?? quiz.title,
    href: `/admin/quizzes/${id}/edit`,
  });

  return apiSuccess({ message: 'Quiz updated' });
}

/* ── DELETE /api/admin/quizzes/[id] ── */
export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;

  const quiz = await db.quiz.findUnique({ where: { id } });
  if (!quiz) return apiError('Quiz not found' , { status: 404 });

  if (quiz.status !== 'DRAFT') {
    return apiError('Hanya kuis berstatus Draft yang dapat dihapus' , { status: 400 });
  }

  auditAdminEntity(admin, 'quiz', 'delete', { type: 'quiz', id: quiz.id, label: quiz.title, href: `/admin/quizzes/${id}/edit` });

  await db.quiz.delete({ where: { id } });

  return apiSuccess({ message: 'Quiz deleted' });
}
