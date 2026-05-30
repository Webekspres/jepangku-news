import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
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

  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

  return NextResponse.json(quiz);
}
