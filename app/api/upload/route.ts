import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadToR2 } from '@/lib/r2';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

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
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `jepangku/uploads/${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

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
    console.error('Upload error:', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
