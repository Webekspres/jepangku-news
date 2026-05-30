import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSlug } from '@/lib/slug';

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const body = await request.json();
  const { title, description, poll_type = 'POLLING', thumbnailUrl, status = 'ACTIVE', options = [] } = body;

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (options.length < 2) return NextResponse.json({ error: 'At least 2 options required' }, { status: 400 });

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
      pointsReward: 5,
    },
  });

  for (let i = 0; i < options.length; i++) {
    await db.pollOption.create({
      data: { pollId: poll.id, optionText: options[i], sortOrder: i },
    });
  }

  return NextResponse.json({ message: 'Poll created', id: poll.id }, { status: 201 });
}
