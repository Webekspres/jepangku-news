import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, withCoreSessionCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const authState = await auth();
  const clerkToken = await authState.getToken();
  const response = NextResponse.json(user);
  if (clerkToken) {
    return withCoreSessionCookie(response, clerkToken);
  }
  return response;
}
