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
import { withRequestLogging } from '@/lib/logging/request-logger';

type Params = { params: Promise<{ id: string }> };

/* ── GET /api/admin/polls/[id] ── */
const GET = withRequestLogging(async (request: NextRequest, { params }: Params) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;

  const poll = await db.poll.findUnique({
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

  if (!poll) return apiError('Poll not found' , { status: 404 });

  return apiSuccess(poll);
});

/* ── PATCH /api/admin/polls/[id] ── */
const PATCH = withRequestLogging(async (request: NextRequest, { params }: Params) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;

  const poll = await db.poll.findUnique({ where: { id } });
  if (!poll) return apiError('Poll not found' , { status: 404 });

  const body = await request.json();
  const {
    title,
    description,
    pollType,
    thumbnailUrl,
    status,
    pointsReward,
    allowGuestVote,
    showResultBeforeVote,
    questions,
  } = body;

  // title hanya wajib jika dikirim bersamaan dengan update konten penuh
  if (title !== undefined && !title?.trim()) {
    return apiError('Title is required' , { status: 400 });
  }

  // Build partial update — hanya field yang dikirim
  const updateData: any = {};
  if (title !== undefined)                 updateData.title = sanitizePlainField(title, 200);
  if (description !== undefined)           updateData.description = description ? sanitizePlainField(description, 1000) : null;
  if (pollType !== undefined)              updateData.pollType = pollType.toUpperCase();
  if (thumbnailUrl !== undefined)          updateData.thumbnailUrl = sanitizeMediaUrl(thumbnailUrl);
  if (status !== undefined)               updateData.status = status.toUpperCase();
  if (pointsReward !== undefined)         updateData.pointsReward = Number(pointsReward);
  if (allowGuestVote !== undefined)       updateData.allowGuestVote = Boolean(allowGuestVote);
  if (showResultBeforeVote !== undefined) updateData.showResultBeforeVote = Boolean(showResultBeforeVote);

  // Update poll metadata
  await db.poll.update({ where: { id }, data: updateData });

  // Sinkronkan pertanyaan secara in-place (update by id) agar suara yang sudah
  // masuk tidak ter-reset. Pertanyaan/opsi yang sudah punya suara tidak boleh
  // dihapus (teks & gambar tetap bisa diperbaiki).
  if (Array.isArray(questions)) {
    const safeQuestions = sanitizeQuestionBundle(questions);

    const existingQuestions = await db.pollQuestion.findMany({
      where: { pollId: id },
      include: {
        _count: { select: { votes: true } },
        options: { select: { id: true, _count: { select: { votes: true } } } },
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

    // Guard: pertanyaan ber-suara tidak boleh dihapus
    const removedQuestions = existingQuestions.filter(
      (q) => !incomingQuestionIds.has(q.id),
    );
    if (removedQuestions.some((q) => q._count.votes > 0)) {
      return apiError(
        'Pertanyaan yang sudah memiliki suara tidak dapat dihapus. Anda tetap bisa memperbaiki teks atau gambarnya.',
        { status: 400 },
      );
    }

    // Guard: opsi ber-suara tidak boleh dihapus
    for (const q of existingQuestions) {
      for (const o of q.options) {
        if (o._count.votes > 0 && !incomingOptionIds.has(o.id)) {
          return apiError(
            'Opsi yang sudah memiliki suara tidak dapat dihapus. Anda tetap bisa memperbaiki teks atau gambarnya.',
            { status: 400 },
          );
        }
      }
    }

    await db.$transaction(async (tx) => {
      if (removedQuestions.length > 0) {
        await tx.pollQuestion.deleteMany({
          where: { id: { in: removedQuestions.map((q) => q.id) } },
        });
      }

      for (const q of safeQuestions) {
        const existing = q.id
          ? existingQuestions.find((eq) => eq.id === q.id)
          : undefined;

        let questionId: string;
        if (existing) {
          await tx.pollQuestion.update({
            where: { id: existing.id },
            data: {
              questionText: q.questionText,
              imageUrl: q.imageUrl,
              sortOrder: q.sortOrder,
            },
          });
          questionId = existing.id;
        } else {
          const created = await tx.pollQuestion.create({
            data: {
              pollId: id,
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
          await tx.pollOption.deleteMany({
            where: { id: { in: removedOptions.map((o) => o.id) } },
          });
        }

        for (const o of q.options) {
          const existingOption = o.id
            ? existingOptions.find((eo) => eo.id === o.id)
            : undefined;
          if (existingOption) {
            await tx.pollOption.update({
              where: { id: existingOption.id },
              data: {
                optionText: o.optionText,
                imageUrl: o.imageUrl,
                sortOrder: o.sortOrder,
              },
            });
          } else {
            await tx.pollOption.create({
              data: {
                questionId,
                optionText: o.optionText,
                imageUrl: o.imageUrl,
                sortOrder: o.sortOrder,
              },
            });
          }
        }
      }
    });
  }

  auditAdminEntity(admin, 'poll', 'update', {
    type: 'poll',
    id,
    label: (updateData.title as string | undefined) ?? poll.title,
    href: `/admin/polls/${id}/edit`,
  });

  return apiSuccess({ message: 'Poll updated' });
});

/* ── PATCH /api/admin/polls/[id]/close  (via ?action=close) ──
   We handle close in the same PATCH with status=CLOSED, but also
   expose a dedicated endpoint pattern via query param for clarity. */

/* ── DELETE /api/admin/polls/[id] ── */
const DELETE = withRequestLogging(async (request: NextRequest, { params }: Params) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;

  const poll = await db.poll.findUnique({ where: { id } });
  if (!poll) return apiError('Poll not found' , { status: 404 });

  if (poll.status !== 'DRAFT') {
    return apiError('Hanya polling berstatus Draft yang dapat dihapus' , { status: 400 });
  }

  auditAdminEntity(admin, 'poll', 'delete', { type: 'poll', id: poll.id, label: poll.title, href: `/admin/polls/${id}/edit` });

  await db.poll.delete({ where: { id } });

  return apiSuccess({ message: 'Poll deleted' });
});

export { GET, PATCH, DELETE };
