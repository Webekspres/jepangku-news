import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

const USERNAME_COOLDOWN_DAYS = 14;

/** Hitung sisa hari cooldown username. Kembalikan 0 jika sudah boleh ganti. */
function getUsernameCooldownDays(usernameChangedAt: Date | null): number {
  if (!usernameChangedAt) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSince = (Date.now() - usernameChangedAt.getTime()) / msPerDay;
  const remaining = USERNAME_COOLDOWN_DAYS - daysSince;
  return remaining > 0 ? Math.ceil(remaining) : 0;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const [profile, fullUser] = await Promise.all([
    db.userProfile.findUnique({ where: { userId: user.id } }),
    db.user.findUnique({ where: { id: user.id } }),
  ]);

  const cooldownDays = getUsernameCooldownDays(
    (fullUser as any)?.usernameChangedAt ?? null
  );

  return NextResponse.json({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    displayName: profile?.displayName ?? user.name,
    bio: profile?.bio ?? '',
    usernameChangedAt: (fullUser as any)?.usernameChangedAt?.toISOString() ?? null,
    usernameCooldownDaysLeft: cooldownDays,
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, username, avatarUrl, displayName, bio } = body;

  // Validate name
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 });
    }
    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Nama terlalu panjang (maks. 100 karakter)' }, { status: 400 });
    }
  }

  // Validate & enforce username cooldown
  const isChangingUsername =
    username !== undefined && username.trim() !== user.username;

  if (username !== undefined) {
    if (typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: 'Username tidak boleh kosong' }, { status: 400 });
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username hanya boleh mengandung huruf kecil, angka, dan underscore' },
        { status: 400 }
      );
    }
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json({ error: 'Username harus 3–30 karakter' }, { status: 400 });
    }

    if (isChangingUsername) {
      // Fetch current usernameChangedAt from DB
      const currentUser = await db.user.findUnique({
        where: { id: user.id },
        select: { usernameChangedAt: true },
      });

      const cooldownDays = getUsernameCooldownDays(
        (currentUser as any)?.usernameChangedAt ?? null
      );
      if (cooldownDays > 0) {
        return NextResponse.json(
          {
            error: `Username baru bisa diganti dalam ${cooldownDays} hari lagi`,
            cooldownDaysLeft: cooldownDays,
          },
          { status: 429 }
        );
      }

      // Check uniqueness (exclude current user)
      const existing = await db.user.findFirst({
        where: { username: username.trim(), id: { not: user.id } },
      });
      if (existing) {
        return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 409 });
      }
    }
  }

  // Validate bio
  if (bio !== undefined && typeof bio === 'string' && bio.length > 300) {
    return NextResponse.json({ error: 'Bio terlalu panjang (maks. 300 karakter)' }, { status: 400 });
  }

  // Build user update payload
  const userUpdate: Record<string, any> = {};
  if (name !== undefined) userUpdate.name = name.trim();
  if (isChangingUsername) {
    userUpdate.username = username.trim();
    userUpdate.usernameChangedAt = new Date();
  }
  if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;

  // Update user fields
  const updatedUser = Object.keys(userUpdate).length > 0
    ? await db.user.update({
        where: { id: user.id },
        data: userUpdate,
      })
    : await db.user.findUnique({ where: { id: user.id } });

  if (!updatedUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Update or create UserProfile (bio / displayName)
  if (displayName !== undefined || bio !== undefined) {
    const existingProfile = await db.userProfile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      await db.userProfile.update({
        where: { userId: user.id },
        data: {
          ...(displayName !== undefined ? { displayName: String(displayName).trim() } : {}),
          ...(bio !== undefined ? { bio: String(bio).trim() || null } : {}),
        },
      });
    } else {
      await db.userProfile.create({
        data: {
          userId: user.id,
          displayName: displayName !== undefined
            ? String(displayName).trim()
            : (name?.trim() ?? updatedUser.name),
          bio: bio !== undefined ? String(bio).trim() || null : null,
        },
      });
    }
  }

  const { passwordHash, ...clean } = updatedUser as any;
  return NextResponse.json({
    ...clean,
    createdAt: clean.createdAt.toISOString(),
    updatedAt: clean.updatedAt.toISOString(),
    lastLoginAt: clean.lastLoginAt?.toISOString() ?? null,
    usernameChangedAt: clean.usernameChangedAt?.toISOString() ?? null,
  });
}
