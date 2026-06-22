import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getAdminActivityLog } from '@/lib/admin-monitoring';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const category = searchParams.get('category') ?? searchParams.get('type') ?? undefined;

  const data = await getAdminActivityLog({ page, category });
  return NextResponse.json(data);
}
