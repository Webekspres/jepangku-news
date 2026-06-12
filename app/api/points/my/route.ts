import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getUserPointBalance,
  getUserPointTransactions,
} from '@/lib/points';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const [totalPoints, transactions] = await Promise.all([
    getUserPointBalance(user.id),
    getUserPointTransactions(user.id, 100),
  ]);

  return NextResponse.json({
    totalPoints,
    transactions: transactions.map((tx: (typeof transactions)[number]) => ({
      id: tx.id,
      activityType: tx.activityType,
      sourceType: tx.sourceType,
      sourceId: tx.sourceId,
      points: tx.points,
      description: tx.description,
      occurredAt: tx.occurredAt.toISOString(),
    })),
  });
}
