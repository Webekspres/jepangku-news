import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fetchCoreLeaderboard } from '@/lib/core/users';
import { isCoreApiConfigured } from '@/lib/core/config';

/** Global XP leaderboard from Core (no weekly filter in Core API yet). */
export async function GET() {
  if (isCoreApiConfigured()) {
    try {
      const { items } = await fetchCoreLeaderboard(10, 0);
      const leaderboard = await Promise.all(
        items.map(async (entry) => {
          const portalUser = await db.user.findUnique({
            where: { id: entry.id },
            select: { username: true, avatarUrl: true },
          });
          const profile = await db.userProfile.findUnique({
            where: { userId: entry.id },
            select: { displayName: true },
          });
          return {
            rank: entry.rank,
            userId: entry.id,
            displayName: profile?.displayName || portalUser?.username || entry.name,
            username: portalUser?.username || '',
            avatarUrl: portalUser?.avatarUrl || entry.imageUrl,
            totalXp: entry.totalXp,
            currentPoints: entry.currentPoints,
            /** Weekly leaderboard pending Core API — use global rank for now */
            period: 'all-time' as const,
          };
        }),
      );
      return NextResponse.json(leaderboard);
    } catch {
      // Fall through to empty if Core unavailable
    }
  }

  return NextResponse.json([]);
}
