import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { sanitizeMediaUrl, sanitizePlainField } from '@/lib/sanitizer';
import { captureException } from '@/lib/monitoring';
import { auditUserProfileUpdate } from '@/lib/audit-routes';

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

  try {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, username, avatarUrl, displayName, bio } = body;
  const safeName = name !== undefined ? sanitizePlainField(name, 100) : undefined;
  const safeDisplayName =
    displayName !== undefined ? sanitizePlainField(displayName, 100) : undefined;
  const safeBio = bio !== undefined ? sanitizePlainField(bio, 300) || null : undefined;
  const safeAvatarUrl =
    avatarUrl !== undefined ? sanitizeMediaUrl(avatarUrl) : undefined;

  // Validate name
  if (safeName !== undefined) {
    if (safeName.length === 0) {
      return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 });
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

  // Build user update payload
  const userUpdate: Record<string, any> = {};
  if (safeName !== undefined) userUpdate.name = safeName;
  if (isChangingUsername) {
    userUpdate.username = username.trim();
    userUpdate.usernameChangedAt = new Date();
  }
  if (safeAvatarUrl !== undefined) userUpdate.avatarUrl = safeAvatarUrl;

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
  if (safeDisplayName !== undefined || safeBio !== undefined) {
    const existingProfile = await db.userProfile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      await db.userProfile.update({
        where: { userId: user.id },
        data: {
          ...(safeDisplayName !== undefined ? { displayName: safeDisplayName } : {}),
          ...(safeBio !== undefined ? { bio: safeBio } : {}),
        },
      });
    } else {
      await db.userProfile.create({
        data: {
          userId: user.id,
          displayName: safeDisplayName ?? safeName ?? updatedUser.name,
          bio: safeBio ?? null,
        },
      });
    }
  }

  const profileChanged =
    safeDisplayName !== undefined || safeBio !== undefined;
  const userChanged = Object.keys(userUpdate).length > 0;

  if (userChanged || profileChanged) {
    auditUserProfileUpdate({ ...user, name: updatedUser.name });
  }

  return NextResponse.json({
    ...updatedUser,
    createdAt: updatedUser.createdAt.toISOString(),
    updatedAt: updatedUser.updatedAt.toISOString(),
    lastLoginAt: updatedUser.lastLoginAt?.toISOString() ?? null,
    usernameChangedAt: updatedUser.usernameChangedAt?.toISOString() ?? null,
  });
  } catch (e) {
    await captureException(e, { route: 'user-profile-patch' });
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
