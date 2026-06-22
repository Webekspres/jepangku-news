import { NextResponse } from 'next/server';
import { clearCoreSessionCookie } from '@/lib/core/session';

export async function POST() {
  await clearCoreSessionCookie();
  return NextResponse.json({ ok: true });
}
