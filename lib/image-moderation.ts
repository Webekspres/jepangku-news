import { logger } from './logger';
import { parseApiResponse } from '@/lib/fetch-api';
import {
  ARTICLE_IMAGE_MAX_BYTES,
  ARTICLE_IMAGE_MAX_LABEL,
} from '@/lib/article-form-helpers';

/** Client-facing upload validation or moderation failure (maps to HTTP 400). */
export class UploadClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadClientError';
  }
}

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MIN_IMAGE_BYTES = 100;
const MAX_IMAGE_BYTES = ARTICLE_IMAGE_MAX_BYTES;

function detectImageType(buffer: Buffer) {
  if (buffer.length >= 4) {
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { ext: 'jpg', mime: 'image/jpeg' };
    }
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return { ext: 'png', mime: 'image/png' };
    }
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    ) {
      return { ext: 'gif', mime: 'image/gif' };
    }
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return { ext: 'webp', mime: 'image/webp' };
    }
  }

  return null;
}

export function validateImageBuffer(buffer: Buffer, contentType: string) {
  if (buffer.length < MIN_IMAGE_BYTES) {
    throw new UploadClientError('File gambar terlalu kecil atau rusak.');
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new UploadClientError(
      `Ukuran file terlalu besar. Maksimal ${ARTICLE_IMAGE_MAX_LABEL}.`,
    );
  }

  const detected = detectImageType(buffer);
  if (!detected) {
    throw new UploadClientError('File bukan gambar yang valid.');
  }

  if (!allowedMimeTypes.includes(contentType)) {
    throw new UploadClientError('Format file tidak didukung.');
  }

  const normalizedContentType = contentType === 'image/jpg' ? 'image/jpeg' : contentType;
  if (detected.mime !== normalizedContentType) {
    throw new UploadClientError(
      'Ekstensi file tidak sesuai isi gambar. Simpan ulang sebagai JPG, PNG, GIF, atau WebP.',
    );
  }

  return detected;
}

export async function moderateImage(buffer: Buffer, contentType: string) {
  validateImageBuffer(buffer, contentType);

  const moderationEndpoint = process.env.IMAGE_MODERATION_ENDPOINT;
  const moderationKey = process.env.IMAGE_MODERATION_API_KEY;

  if (!moderationEndpoint || !moderationKey) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('image_moderation.skipped', {
        reason: 'IMAGE_MODERATION_ENDPOINT or IMAGE_MODERATION_API_KEY not configured',
      });
    }
    return true;
  }

  const payload = {
    contentType,
    imageBase64: buffer.toString('base64'),
  };

  const response = await fetch(moderationEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': moderationKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new UploadClientError('Layanan moderasi gambar sedang bermasalah.');
  }

  const result = (await parseApiResponse(response)) as {
    decision?: string;
    moderation?: string;
  };
  if (result?.decision === 'reject' || result?.moderation === 'unsafe') {
    logger.warn('image_moderation.rejected', { contentType, decision: result.decision || result.moderation });
    throw new UploadClientError('Gambar ditolak oleh sistem moderasi.');
  }

  logger.info('image_moderation.passed', { contentType, decision: result.decision || result.moderation });
  return true;
}
