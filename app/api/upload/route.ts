import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { captureException } from '@/lib/monitoring';
import { getCurrentUser } from '@/lib/auth';
import { auditAdminEntity } from '@/lib/audit-routes';
import { uploadToR2 } from '@/lib/r2';
import { db } from '@/lib/db';
import {
  moderateImage,
  UploadClientError,
  validateImageBuffer,
} from '@/lib/image-moderation';
import { optimizeImageBuffer, parseUploadPurpose } from '@/lib/image-optimize';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Not authenticated' , { status: 401 });
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
    const purpose = parseUploadPurpose(formData.get('purpose'));

    if (!file) {
      return apiError('No file provided' , { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return apiError('File too large (max 10MB)' , { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return apiError('Invalid file type' , { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = validateImageBuffer(buffer, file.type);
    await moderateImage(buffer, file.type);

    const optimized = await optimizeImageBuffer(buffer, purpose, detected.ext);
    const uploadBuffer = optimized.buffer;
    const uploadContentType = optimized.contentType;

    const fileName = `portal-berita/${user.id}/${purpose}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${optimized.ext}`;

    const url = await uploadToR2(uploadBuffer, fileName, uploadContentType);

    const fileRecord = await db.file.create({
      data: {
        storagePath: fileName,
        originalFilename: file.name,
        contentType: uploadContentType,
        size: uploadBuffer.length,
        userId: user.id,
      },
    });

    auditAdminEntity(user, 'file', 'upload', {
      type: 'file',
      id: fileRecord.id,
      label: file.name,
    });

    return apiSuccess({ url, path: fileName });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Upload failed';
    const status = e instanceof UploadClientError ? 400 : 500;
    if (status === 500) {
      await captureException(e, { route: 'upload', userId: user?.id });
    }
    return apiSuccess({ error: message }, { status });
  }
}
