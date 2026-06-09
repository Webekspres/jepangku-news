import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCoreSessionToken } from '@/lib/core/session';
import { fetchCoreUserMe } from '@/lib/core/users';

/** Points history lives in Core gamification_logs — user-facing ledger API pending. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const coreJwt = await getCoreSessionToken();
  const profile = coreJwt ? await fetchCoreUserMe(coreJwt) : null;

  return NextResponse.json({
    totalPoints: profile?.currentPoints ?? user.totalPoints,
    totalXp: profile?.totalXp ?? user.totalXp,
    currentLevel: profile?.currentLevel ?? user.currentLevel,
    transactions: [],
    message: 'Riwayat transaksi global akan tersedia dari jepangku-core.',
  });
}
