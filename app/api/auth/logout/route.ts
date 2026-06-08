import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    message: 'Use Clerk sign-out on the client',
    provider: 'clerk',
  });
}
