import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fetchCoreLeaderboard } from '@/lib/core/users';
import { isCoreApiConfigured } from '@/lib/core/config';
import { fallbackUsernameFromCoreUser } from '@/lib/username';

/** Global XP leaderboard from Core (no weekly filter in Core API yet). */
export async function GET() {
  if (isCoreApiConfigured()) {
    try {
      const { items } = await fetchCoreLeaderboard(10, 0);
      const ids = items.map((entry) => entry.id);

      const [portalUsers, profiles] = await Promise.all([
        db.user.findMany({
          where: { id: { in: ids } },
          select: { id: true, username: true, avatarUrl: true },
        }),
        db.userProfile.findMany({
          where: { userId: { in: ids } },
          select: { userId: true, displayName: true },
        }),
      ]);

      const userById = new Map(portalUsers.map((u) => [u.id, u]));
      const profileByUserId = new Map(profiles.map((p) => [p.userId, p]));

      const leaderboard = items.map((entry) => {
        const portalUser = userById.get(entry.id);
        const profile = profileByUserId.get(entry.id);
        const portalUsername = portalUser?.username ?? null;

        return {
          rank: entry.rank,
          userId: entry.id,
          displayName: profile?.displayName || portalUsername || entry.name,
          username: portalUsername || fallbackUsernameFromCoreUser(entry),
          profileLinked: Boolean(portalUsername),
          avatarUrl: portalUser?.avatarUrl || entry.imageUrl,
          totalXp: entry.totalXp,
          currentPoints: entry.currentPoints,
          /** Weekly leaderboard pending Core API — use global rank for now */
          period: 'all-time' as const,
        };
      });

      return NextResponse.json(leaderboard);
    } catch {
      // Fall through to empty if Core unavailable
    }
  }

  return NextResponse.json([]);
}
