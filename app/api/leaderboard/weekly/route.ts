import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const grouped = await db.pointTransaction.groupBy({
    by: ['userId'],
    where: { sourceApp: 'news', occurredAt: { gte: weekStart } },
    _sum: { points: true },
    orderBy: { _sum: { points: 'desc' } },
    take: 10,
  });

  const leaderboard = await Promise.all(
    grouped.map(async (entry: { userId: string; _sum: { points: number | null } }, idx: number) => {
      const user = await db.user.findUnique({
        where: { id: entry.userId },
        select: { name: true, username: true, avatarUrl: true },
      });
      const profile = await db.userProfile.findUnique({
        where: { userId: entry.userId },
        select: { displayName: true },
      });
      return {
        rank: idx + 1,
        userId: entry.userId,
        displayName: profile?.displayName || user?.name || 'Unknown',
        username: user?.username || '',
        avatarUrl: user?.avatarUrl || null,
        weeklyPoints: entry._sum.points || 0,
      };
    })
  );

  return NextResponse.json(leaderboard);
}
