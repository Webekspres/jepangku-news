import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { auditAdminEntity } from '@/lib/audit-routes';
import { db } from '@/lib/db';
import {
  sanitizeMediaUrl,
  sanitizePlainField,
  sanitizeQuestionBundle,
} from '@/lib/sanitizer';

type Params = { params: Promise<{ id: string }> };

/* ── GET /api/admin/polls/[id] ── */
export async function GET(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

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

  if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

  return NextResponse.json(poll);
}

/* ── PATCH /api/admin/polls/[id] ── */
export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  const poll = await db.poll.findUnique({ where: { id } });
  if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

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
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
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

  // Replace questions if provided
  if (Array.isArray(questions)) {
    const safeQuestions = sanitizeQuestionBundle(questions);
    await db.pollQuestion.deleteMany({ where: { pollId: id } });

    for (let qi = 0; qi < safeQuestions.length; qi++) {
      const q = safeQuestions[qi];
      const question = await db.pollQuestion.create({
        data: {
          pollId: id,
          questionText: q.questionText,
          imageUrl: q.imageUrl,
          sortOrder: q.sortOrder,
        },
      });

      for (let oi = 0; oi < q.options.length; oi++) {
        const o = q.options[oi];
        await db.pollOption.create({
          data: {
            questionId: question.id,
            optionText: o.optionText,
            imageUrl: o.imageUrl,
            sortOrder: o.sortOrder,
          },
        });
      }
    }
  }

  auditAdminEntity(admin, 'poll', 'update', {
    type: 'poll',
    id,
    label: (updateData.title as string | undefined) ?? poll.title,
    href: `/admin/polls/${id}/edit`,
  });

  return NextResponse.json({ message: 'Poll updated' });
}

/* ── PATCH /api/admin/polls/[id]/close  (via ?action=close) ──
   We handle close in the same PATCH with status=CLOSED, but also
   expose a dedicated endpoint pattern via query param for clarity. */

/* ── DELETE /api/admin/polls/[id] ── */
export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  const poll = await db.poll.findUnique({ where: { id } });
  if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

  if (poll.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Hanya polling berstatus Draft yang dapat dihapus' }, { status: 400 });
  }

  auditAdminEntity(admin, 'poll', 'delete', { type: 'poll', id: poll.id, label: poll.title, href: `/admin/polls/${id}/edit` });

  await db.poll.delete({ where: { id } });

  return NextResponse.json({ message: 'Poll deleted' });
}
