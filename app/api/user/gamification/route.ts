import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchCoreUserProfile } from '@/lib/core/users';
import { isCoreApiConfigured } from '@/lib/core/config';

export const dynamic = 'force-dynamic';

/** Saldo poin live dari Core — tanpa exchange JWT (cepat, untuk Navbar). */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!isCoreApiConfigured()) {
    return NextResponse.json({
      totalPoints: 0,
      totalXp: 0,
      currentLevel: 1,
    });
  }

  const profile = await fetchCoreUserProfile(user.id);
  if (!profile) {
    return NextResponse.json(
      { error: 'Gamification profile unavailable' },
      { status: 503 },
    );
  }

  return NextResponse.json({
    totalPoints: profile.currentPoints,
    totalXp: profile.totalXp,
    currentLevel: profile.currentLevel,
  });
}
