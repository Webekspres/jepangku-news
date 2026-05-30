import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const transactions = await db.pointTransaction.findMany({
    where: { userId: user.id, sourceApp: 'news' },
    orderBy: { occurredAt: 'desc' },
    take: 100,
  });

  return NextResponse.json(transactions);
}
