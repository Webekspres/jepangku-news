import { db } from './db';
import { Prisma } from '@prisma/client';

export async function awardPoints(
  userId: string,
  activityType: string,
  sourceType: string,
  sourceId: string | null,
  points: number,
  description?: string
): Promise<boolean> {
  try {
    // Quick check to avoid extra work
    const existing = await db.pointTransaction.findFirst({
      where: {
        userId,
        sourceApp: 'news',
        activityType,
        sourceType,
        ...(sourceId ? { sourceId } : {}),
      },
    });

    if (existing) return false;

    // Neon HTTP adapter tidak mendukung interactive transaction, jadi operasi
    // dijalankan berurutan. Unique constraint pada pointTransaction mencegah
    // duplikasi/race; user.totalPoints di-increment setelah transaksi tercatat.
    try {
      await db.pointTransaction.create({
        data: {
          userId,
          sourceApp: 'news',
          activityType,
          sourceType,
          sourceId: sourceId ?? null,
          points,
          description: description ?? null,
          occurredAt: new Date(),
        },
      });
    } catch (e) {
      // Handle unique constraint violation (race condition)
      if ((e as any)?.code === 'P2002' || (e as any)?.code === '23505') {
        // Duplicate detected, treat as already awarded
        return false;
      }
      throw e;
    }

    await db.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: points } },
    });

    return true;
  } catch (e) {
    console.error('Error awarding points:', e);
    return false;
  }
}

export async function checkDailyLogin(userId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const existing = await db.dailyLoginReward.findFirst({
      where: { userId, sourceApp: 'news', rewardDate: today },
    });

    if (existing) return false;

    const points = 3;

    const transaction = await db.pointTransaction.create({
      data: {
        userId,
        sourceApp: 'news',
        activityType: 'daily_login',
        sourceType: 'system',
        sourceId: null,
        points,
        description: 'Daily login reward',
        occurredAt: new Date(),
      },
    });

    await db.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: points } },
    });

    await db.dailyLoginReward.create({
      data: {
        userId,
        sourceApp: 'news',
        rewardDate: today,
        pointsAwarded: points,
        pointTransactionId: transaction.id,
      },
    });

    return true;
  } catch (e) {
    console.error('Error checking daily login:', e);
    return false;
  }
}
