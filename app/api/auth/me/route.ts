import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequestUser, withCoreSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const result = await authenticateRequestUser(request);
  if (!result) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const response = NextResponse.json(result.user);
  if (result.clerkToken) {
    return withCoreSessionCookie(response, result.clerkToken);
  }
  return response;
}
