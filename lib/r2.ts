import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { R2_OBJECT_CACHE_CONTROL } from '@/lib/media/constants';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'storage.r2' });

const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), '.uploads');

const hasR2Config =
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_ACCESS_KEY_SECRET &&
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_BUCKET_NAME;

const s3Client = hasR2Config
  ? new S3Client({
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_ACCESS_KEY_SECRET!,
      },
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    })
  : null;

function buildR2PublicUrl(fileName: string): string {
  const publicUrl =
    process.env.R2_PUBLIC_URL ||
    `https://${process.env.R2_BUCKET_NAME}.r2.cloudflarestorage.com`;
  return `${publicUrl.replace(/\/$/, '')}/${fileName}`;
}

async function uploadToLocal(file: Buffer, fileName: string): Promise<string> {
  const dest = path.join(LOCAL_UPLOAD_ROOT, fileName);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, file);
  log.info('r2.local_upload', { fileName, dest });
  return `/api/files/mock/${fileName}`;
}

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  if (!s3Client) {
    log.warn('r2.upload.skipped', { reason: 'R2 not configured', fileName });
    return uploadToLocal(file, fileName);
  }

  const start = Date.now();

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: file,
      ContentType: contentType,
      CacheControl: R2_OBJECT_CACHE_CONTROL,
    });

    await s3Client.send(command);

    const url = buildR2PublicUrl(fileName);
    log.info('r2.upload.ok', {
      fileName,
      contentType,
      sizeBytes: file.length,
      durationMs: Date.now() - start,
    });
    return url;
  } catch (error) {
    log.warn('r2.upload.failed', {
      fileName,
      contentType,
      sizeBytes: file.length,
      durationMs: Date.now() - start,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
    throw error;
  }
}

export async function deleteFromR2(fileName: string): Promise<void> {
  if (!s3Client) {
    log.warn('r2.delete.skipped', { reason: 'R2 not configured', fileName });
    return;
  }

  const start = Date.now();

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
    });

    await s3Client.send(command);

    log.info('r2.delete.ok', {
      fileName,
      durationMs: Date.now() - start,
    });
  } catch (error) {
    log.warn('r2.delete.failed', {
      fileName,
      durationMs: Date.now() - start,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
    throw error;
  }
}

export async function getSignedUrlR2(fileName: string, _expiresIn = 3600): Promise<string> {
  if (!s3Client) {
    log.warn('r2.signed_url.skipped', { reason: 'R2 not configured', fileName });
    return `/api/files/mock/${fileName}`;
  }

  const url = buildR2PublicUrl(fileName);
  log.info('r2.signed_url.generated', { fileName, expiresIn: _expiresIn });
  return url;
}

export { buildR2PublicUrl, s3Client };
