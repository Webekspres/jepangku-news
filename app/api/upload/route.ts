import { NextRequest, NextResponse } from 'next/server';
import { captureException } from '@/lib/monitoring';
import { getCurrentUser } from '@/lib/auth';
import { uploadToR2 } from '@/lib/r2';
import { db } from '@/lib/db';
import { moderateImage, validateImageBuffer } from '@/lib/image-moderation';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const blocked = await enforceRateLimit(request, 'upload', {
    max: 20,
    windowMs: 60 * 60 * 1000,
    identifier: user.id,
    message: 'Terlalu banyak upload. Coba lagi nanti.',
  });
  if (blocked) return blocked;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = validateImageBuffer(buffer, file.type);
    await moderateImage(buffer, file.type);

    const fileName = `jepangku/uploads/${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${detected.ext}`;

    const url = await uploadToR2(buffer, fileName, file.type);

    await db.file.create({
      data: {
        storagePath: fileName,
        originalFilename: file.name,
        contentType: file.type,
        size: file.size,
        userId: user.id,
      },
    });

    return NextResponse.json({ url, path: fileName });
  } catch (e: any) {
    await captureException(e, { route: 'upload', userId: user?.id });
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 });
  }
}
