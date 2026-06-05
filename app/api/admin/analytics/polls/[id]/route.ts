import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getPollAnalytics } from '@/lib/analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  const data = await getPollAnalytics(id);
  if (!data) {
    return NextResponse.json({ error: 'Polling tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(data);
}
