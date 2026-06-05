import { db } from './db';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 30;

export function normalizeSearchQuery(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const q = raw.trim();
  if (q.length === 0) return null;
  return q.slice(0, 200);
}

export function clampSearchLimit(raw: unknown): number {
  const n = typeof raw === 'string' ? parseInt(raw, 10) : NaN;
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}

export async function searchAll(query: string, limit: number) {
  const mode = 'insensitive' as const;

  const [articles, quizzes, polls] = await Promise.all([
    db.article.findMany({
      where: {
        status: 'PUBLISHED',
        visibility: 'public',
        OR: [
          { title: { contains: query, mode } },
          { excerpt: { contains: query, mode } },
          { content: { contains: query, mode } },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        author: { select: { name: true, username: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    db.quiz.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: query, mode } },
          { description: { contains: query, mode } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { _count: { select: { questions: true } } },
    }),
    db.poll.findMany({
      where: {
        status: { in: ['ACTIVE', 'CLOSED'] },
        OR: [
          { title: { contains: query, mode } },
          { description: { contains: query, mode } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        questions: {
          include: { options: { select: { voteCount: true } } },
        },
      },
    }),
  ]);

  return {
    articles,
    quizzes: quizzes.map((q) => ({
      ...q,
      questionCount: q._count.questions,
      _count: undefined,
    })),
    polls: polls.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      thumbnailUrl: p.thumbnailUrl,
      pollType: p.pollType,
      status: p.status,
      pointsReward: p.pointsReward,
      questionCount: p.questions.length,
      totalVotes: p.questions.reduce(
        (sum, q) => sum + q.options.reduce((s, o) => s + o.voteCount, 0),
        0,
      ),
      createdAt: p.createdAt,
    })),
    total: articles.length + quizzes.length + polls.length,
  };
}
