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
  const type = searchParams.get('type');

  const where: any = {};
  if (status) where.status = status.toUpperCase();
  if (type) where.pollType = type.toUpperCase();

  const polls = await db.poll.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      title: true,
      slug: true,
      pollType: true,
      status: true,
      pointsReward: true,
      allowGuestVote: true,
      showResultBeforeVote: true,
      createdAt: true,
      _count: {
        select: { questions: true, votes: true },
      },
    },
  });

  return apiSuccess(polls);
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const body = await request.json();
  const {
    title,
    description,
    poll_type = 'POLLING',
    thumbnailUrl,
    status = 'ACTIVE',
    pointsReward = 5,
    allowGuestVote = false,
    showResultBeforeVote = false,
    questions = [],
  } = body;

  const safeTitle = sanitizePlainField(title, 200);
  if (!safeTitle) return apiError('Title is required' , { status: 400 });
  if (!Array.isArray(questions) || questions.length < 1)
    return apiError('At least 1 question required' , { status: 400 });

  const safeQuestions = sanitizeQuestionBundle(questions);
  for (const q of safeQuestions) {
    if (!q.questionText)
      return apiError('Each question must have questionText' , { status: 400 });
    if (q.options.length < 2)
      return apiError('Each question must have at least 2 options' , { status: 400 });
    for (const o of q.options) {
      if (!o.optionText)
        return apiError('Each option must have optionText' , { status: 400 });
    }
  }

  const slug = createSlug(safeTitle);

  const poll = await db.poll.create({
    data: {
      createdBy: admin.id,
      title: safeTitle,
      slug,
      description: description ? sanitizePlainField(description, 1000) : null,
      pollType: poll_type.toUpperCase() as any,
      status: status.toUpperCase() as any,
      thumbnailUrl: sanitizeMediaUrl(thumbnailUrl),
      pointsReward: Number(pointsReward) || 5,
      allowGuestVote: Boolean(allowGuestVote),
      showResultBeforeVote: Boolean(showResultBeforeVote),
    },
  });

  for (let qi = 0; qi < safeQuestions.length; qi++) {
    const q = safeQuestions[qi];
    const question = await db.pollQuestion.create({
      data: {
        pollId: poll.id,
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

  auditAdminEntity(admin, 'poll', 'create', { type: 'poll', id: poll.id, label: poll.title, href: `/admin/polls/${poll.id}/edit` });

  return apiSuccess({ message: 'Poll created', id: poll.id }, { status: 201 });
}
