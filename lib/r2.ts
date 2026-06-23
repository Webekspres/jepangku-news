import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { R2_OBJECT_CACHE_CONTROL } from '@/lib/media/constants';

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
  return `/api/files/mock/${fileName}`;
}

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  if (!s3Client) {
    console.warn('R2 is not configured. Storing upload locally under .uploads/');
    return uploadToLocal(file, fileName);
  }

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileName,
    Body: file,
    ContentType: contentType,
    CacheControl: R2_OBJECT_CACHE_CONTROL,
  });

  await s3Client.send(command);

  return buildR2PublicUrl(fileName);
}

export async function deleteFromR2(fileName: string): Promise<void> {
  if (!s3Client) {
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileName,
  });

  await s3Client.send(command);
}

export async function getSignedUrlR2(fileName: string, expiresIn = 3600): Promise<string> {
  if (!s3Client) {
    return `/api/files/mock/${fileName}`;
  }
  return buildR2PublicUrl(fileName);
}

export { buildR2PublicUrl, s3Client };
