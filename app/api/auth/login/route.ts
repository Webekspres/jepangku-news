import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createAccessToken, createRefreshToken, setAuthCookies } from '@/lib/auth';
import { checkDailyLogin } from '@/lib/points';
import { seedDatabase } from '@/lib/seed';

export async function POST(request: NextRequest) {
  await seedDatabase();
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const emailOrUsername = email.toLowerCase();

    const user = await db.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status === 'banned') {
      return NextResponse.json({ error: 'Account is banned' }, { status: 403 });
    }

    // Award daily login points
    await checkDailyLogin(user.id);

    // Refresh user to get updated points
    const updatedUser = await db.user.findUnique({ where: { id: user.id } });

    const accessToken = createAccessToken(user.id, user.email, user.role);
    const refreshToken = createRefreshToken(user.id);

    const responseData = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      totalPoints: updatedUser?.totalPoints ?? user.totalPoints,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    };

    const response = NextResponse.json(responseData);
    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json({ error: e.message || 'Login failed' }, { status: 500 });
  }
}
