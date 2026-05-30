import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';

  const where: any = {};
  if (role) where.role = role.toUpperCase();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      id: true, name: true, username: true, email: true,
      role: true, status: true, totalPoints: true,
      avatarUrl: true, createdAt: true,
      _count: { select: { articles: true } },
    },
  });

  return NextResponse.json(
    users.map((u: typeof users[number]) => ({ ...u, articleCount: u._count.articles }))
  );
}
