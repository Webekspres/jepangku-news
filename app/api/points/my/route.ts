import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import {
  getUserPointBalance,
  getUserPointTransactions,
} from '@/lib/points';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return apiError('Not authenticated' , { status: 401 });

  const [totalPoints, transactions] = await Promise.all([
    getUserPointBalance(user.id),
    getUserPointTransactions(user.id, 100),
  ]);

  return apiSuccess({
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
