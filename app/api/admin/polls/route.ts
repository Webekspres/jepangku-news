import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSlug } from '@/lib/slug';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

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

  return NextResponse.json(polls);
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

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

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!Array.isArray(questions) || questions.length < 1)
    return NextResponse.json({ error: 'At least 1 question required' }, { status: 400 });

  for (const q of questions) {
    if (!q.questionText?.trim())
      return NextResponse.json({ error: 'Each question must have questionText' }, { status: 400 });
    if (!Array.isArray(q.options) || q.options.length < 2)
      return NextResponse.json({ error: 'Each question must have at least 2 options' }, { status: 400 });
    for (const o of q.options) {
      if (!o.optionText?.trim())
        return NextResponse.json({ error: 'Each option must have optionText' }, { status: 400 });
    }
  }

  const slug = createSlug(title);

  const poll = await db.poll.create({
    data: {
      createdBy: admin.id,
      title,
      slug,
      description: description || null,
      pollType: poll_type.toUpperCase() as any,
      status: status.toUpperCase() as any,
      thumbnailUrl: thumbnailUrl || null,
      pointsReward: Number(pointsReward) || 5,
      allowGuestVote: Boolean(allowGuestVote),
      showResultBeforeVote: Boolean(showResultBeforeVote),
    },
  });

  for (let qi = 0; qi < questions.length; qi++) {
    const q = questions[qi];
    const question = await db.pollQuestion.create({
      data: {
        pollId: poll.id,
        questionText: q.questionText,
        imageUrl: q.imageUrl || null,
        sortOrder: q.sortOrder ?? qi,
      },
    });

    for (let oi = 0; oi < q.options.length; oi++) {
      const o = q.options[oi];
      await db.pollOption.create({
        data: {
          questionId: question.id,
          optionText: o.optionText,
          imageUrl: o.imageUrl || null,
          sortOrder: o.sortOrder ?? oi,
        },
      });
    }
  }

  return NextResponse.json({ message: 'Poll created', id: poll.id }, { status: 201 });
}
