import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { captureException } from '@/lib/monitoring';
import { getCurrentUser } from '@/lib/auth';
import { hasNewsAdminAccess } from '@/lib/auth/types';
import { auditAdminEntity } from '@/lib/audit-routes';
import { uploadToR2, deleteFromR2 } from '@/lib/r2';
import { extractR2Key } from '@/lib/media/url';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
  moderateImage,
  UploadClientError,
  validateImageBuffer,
} from '@/lib/image-moderation';
import { optimizeImageBuffer, parseUploadPurpose } from '@/lib/image-optimize';
import { enforceRateLimit } from '@/lib/rate-limit';
import { withRequestLogging } from '@/lib/logging/request-logger';
import {
  ARTICLE_IMAGE_MAX_BYTES,
  ARTICLE_IMAGE_MAX_LABEL,
} from '@/lib/article-form-helpers';

const POST = withRequestLogging(async (request: NextRequest) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Sesi tidak valid. Silakan masuk kembali.', { status: 401 });
  }

  const blocked = await enforceRateLimit(request, 'upload', {
    max: 20,
    windowMs: 60 * 60 * 1000,
    identifier: user.id,
    message: 'Terlalu banyak upload. Coba lagi nanti.',
  });
  if (blocked) {
    logger.warn('upload.rate_limited', { userId: user.id });
    return blocked;
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const purpose = parseUploadPurpose(formData.get('purpose'));

    if (!file) {
      return apiError('Tidak ada file yang diunggah.', { status: 400 });
    }

    if (file.size > ARTICLE_IMAGE_MAX_BYTES) {
      logger.warn('upload.file_too_large', { userId: user.id, fileName: file.name, size: file.size, maxSize: ARTICLE_IMAGE_MAX_BYTES });
      return apiError(`Ukuran file terlalu besar. Maksimal ${ARTICLE_IMAGE_MAX_LABEL}.`, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      logger.warn('upload.invalid_file_type', { userId: user.id, fileName: file.name, contentType: file.type });
      return apiError('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.', { status: 400 });
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

    logger.info('upload.completed', {
      userId: user.id,
      fileId: fileRecord.id,
      fileName: file.name,
      size: uploadBuffer.length,
      contentType: uploadContentType,
      purpose,
    });

    return apiSuccess({ url, path: fileName });
  } catch (e: unknown) {
    const rawMessage = e instanceof Error ? e.message : 'Upload failed';
    const message =
      e instanceof UploadClientError
        ? rawMessage
        : 'Upload gagal. Coba lagi atau pilih gambar lain.';
    const status = e instanceof UploadClientError ? 400 : 500;
    if (status === 500) {
      await captureException(e, { route: 'upload', userId: user?.id });
    }
    return apiError(message, { status });
  }
});

/**
 * DELETE /api/upload
 *
 * Immediately removes a previously uploaded object from Cloudflare R2 so the
 * bucket does not accumulate orphaned images when users replace or remove them.
 * Accepts a JSON body of `{ url }` or `{ path }`. Only the owner of the object
 * (key prefixed with their user id) or an admin may delete it; non-R2 / external
 * URLs are treated as a no-op so callers can fire-and-forget safely.
 */
const DELETE = withRequestLogging(async (request: NextRequest) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Not authenticated', { status: 401 });
  }

  const blocked = await enforceRateLimit(request, 'upload-delete', {
    max: 60,
    windowMs: 60 * 60 * 1000,
    identifier: user.id,
    message: 'Terlalu banyak permintaan. Coba lagi nanti.',
  });
  if (blocked) {
    logger.warn('upload.delete_rate_limited', { userId: user.id });
    return blocked;
  }

  try {
    const body = await request.json().catch(() => ({}));
    const target =
      typeof body?.path === 'string'
        ? body.path
        : typeof body?.url === 'string'
          ? body.url
          : '';

    const key = extractR2Key(target);
    if (!key) {
      // External / empty / non-R2 value — nothing for us to clean up.
      return apiSuccess({ deleted: false });
    }

    const isAdmin = hasNewsAdminAccess(user);
    if (!isAdmin && !key.startsWith(`portal-berita/${user.id}/`)) {
      return apiError('You can only delete your own uploads', { status: 403 });
    }

    await deleteFromR2(key);
    await db.file.deleteMany({ where: { storagePath: key } });

    auditAdminEntity(user, 'file', 'delete', {
      type: 'file',
      id: key,
      label: key,
    });

    logger.info('upload.deleted', { userId: user.id, path: key, isAdmin });

    return apiSuccess({ deleted: true, path: key });
  } catch (e: unknown) {
    await captureException(e, { route: 'upload-delete', userId: user?.id });
    const message = e instanceof Error ? e.message : 'Delete failed';
    return apiError(message, { status: 500 });
  }
});

export { POST, DELETE };
