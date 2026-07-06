import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api-response';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'ACTIVE';
  const sort = searchParams.get('sort') || 'createdAt:desc';
  const limit = Number(searchParams.get('limit') || '12');
  const page = Math.max(Number(searchParams.get('page') || '1'), 1);

  const where = { status: status.toUpperCase() as 'ACTIVE' | 'DRAFT' | 'INACTIVE' };

  // Parse sort parameter (format: field:direction)
  let orderBy: any = { createdAt: 'desc' };
  if (sort.includes(':')) {
    const [field, direction] = sort.split(':');
    orderBy = { [field]: direction };
  } else if (sort === 'participantCount') {
    orderBy = { participantCount: 'desc' };
  }

  const [total, quizzes] = await Promise.all([
    db.quiz.count({ where }),
    db.quiz.findMany({
      where,
      orderBy,
      include: { _count: { select: { questions: true } } },
      take: limit,
      skip: (page - 1) * limit,
    }),
  ]);

  return apiSuccess({
    total,
    quizzes: quizzes.map((q) => ({
      ...q,
      questionCount: q._count.questions,
    })),
  });
}
