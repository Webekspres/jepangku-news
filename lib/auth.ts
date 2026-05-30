import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('JWT_SECRET is required in production'); })() : 'fallback-secret-for-development-only');

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createAccessToken(userId: string, email: string, role?: string): string {
  return jwt.sign(
    {
      sub: userId,
      email: email,
      role: role || 'USER',
      type: 'access',
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function createRefreshToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
      type: 'refresh',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function getCurrentUser(request: NextRequest) {
  let token = request.cookies.get('access_token')?.value;

  if (!token) {
    const authHeader = request.headers.get('Authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.type !== 'access') {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return null;
    }

    const { passwordHash, ...cleanUser } = user;
    return {
      ...cleanUser,
      createdAt: cleanUser.createdAt.toISOString(),
      updatedAt: cleanUser.updatedAt.toISOString(),
      lastLoginAt: cleanUser.lastLoginAt?.toISOString() || null,
    };
  } catch (err) {
    return null;
  }
}

export async function getCurrentAdmin(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== 'ADMIN') {
    return null;
  }
  return user;
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  response.cookies.set({
    name: 'access_token',
    value: accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 900, // 15 minutes
    path: '/',
  });

  response.cookies.set({
    name: 'refresh_token',
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 604800, // 7 days
    path: '/',
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
}
