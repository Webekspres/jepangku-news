import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  getQuizLeaderboard,
  parseQuizLeaderboardPeriod,
} from '@/lib/quiz/leaderboard';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const quiz = await db.quiz.findFirst({
    where: { slug, status: 'ACTIVE' },
    select: { id: true, title: true, slug: true },
  });

  if (!quiz) {
    return NextResponse.json({ error: 'Kuis tidak ditemukan' }, { status: 404 });
  }

  const period = parseQuizLeaderboardPeriod(
    new URL(request.url).searchParams.get('period'),
  );

  const entries = await getQuizLeaderboard(quiz.id, period, 20);

  return NextResponse.json({
    quiz: { id: quiz.id, title: quiz.title, slug: quiz.slug },
    period,
    entries,
  });
}
