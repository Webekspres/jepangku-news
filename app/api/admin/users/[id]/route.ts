import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, username: true, email: true,
      role: true, status: true, totalPoints: true,
      avatarUrl: true, createdAt: true, updatedAt: true,
    },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const [articles, transactions, bookmarkCount, quizAttempts, pollVotes] = await Promise.all([
    db.article.findMany({
      where: { authorId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { category: { select: { name: true, slug: true } } },
    }),
    db.pointTransaction.findMany({
      where: { userId: id },
      orderBy: { occurredAt: 'desc' },
      take: 20,
    }),
    db.bookmark.count({ where: { userId: id, deletedAt: null } }),
    db.quizAttempt.count({ where: { userId: id } }),
    db.pollVote.count({ where: { userId: id } }),
  ]);

  return NextResponse.json({
    user,
    articles,
    recentTransactions: transactions,
    stats: { bookmarkCount, quizAttempts, pollVotes, articleCount: articles.length },
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { role, status } = body;

  const updateData: any = {};
  if (role && ['USER', 'ADMIN'].includes(role.toUpperCase())) updateData.role = role.toUpperCase();
  if (status && ['active', 'inactive', 'banned'].includes(status)) updateData.status = status;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  await db.user.update({ where: { id }, data: updateData });
  return NextResponse.json({ message: 'User updated' });
}
