import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createAccessToken, createRefreshToken, setAuthCookies } from '@/lib/auth';
import { seedDatabase } from '@/lib/seed';

export async function POST(request: NextRequest) {
  await seedDatabase();
  try {
    const body = await request.json();
    const { name, username, email, password } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();
    const usernameLower = username.toLowerCase();

    const existingEmail = await db.user.findUnique({ where: { email: emailLower } });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const existingUsername = await db.user.findUnique({ where: { username: usernameLower } });
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        username: usernameLower,
        email: emailLower,
        passwordHash,
        role: 'USER',
        status: 'active',
        totalPoints: 0,
        profile: {
          create: { displayName: name },
        },
      },
    });

    const accessToken = createAccessToken(user.id, user.email, user.role);
    const refreshToken = createRefreshToken(user.id);

    const responseData = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      totalPoints: user.totalPoints,
      createdAt: user.createdAt.toISOString(),
    };

    const response = NextResponse.json(responseData);
    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (e: any) {
    console.error('Register error:', e);
    return NextResponse.json({ error: e.message || 'Registration failed' }, { status: 500 });
  }
}
