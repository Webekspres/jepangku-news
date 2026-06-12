import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserPointBalance } from '@/lib/points';

export const dynamic = 'force-dynamic';

/** Live portal point balance from News DB — for Navbar refresh. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const totalPoints = await getUserPointBalance(user.id);

  return NextResponse.json({
    totalPoints,
  });
}
