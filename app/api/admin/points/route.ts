import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getAdminPointsSummary } from '@/lib/admin-monitoring';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period');
  const data = await getAdminPointsSummary(period);
  return NextResponse.json(data);
}
