import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'ACTIVE';

  const quizzes = await db.quiz.findMany({
    where: { status: status.toUpperCase() as any },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { questions: true } } },
  });

  return NextResponse.json(
    quizzes.map((q: typeof quizzes[number]) => ({ ...q, questionCount: q._count.questions }))
  );
}
