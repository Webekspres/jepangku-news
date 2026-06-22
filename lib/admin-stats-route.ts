import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';

export function createAdminStatsRoute<T extends Record<string, number>>(
  getStats: () => Promise<T>,
) {
  return async function GET(request: NextRequest) {
    const admin = await getCurrentAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    const stats = await getStats();
    return NextResponse.json(stats);
  };
}
