import { readFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { R2_OBJECT_CACHE_CONTROL } from '@/lib/media/constants';

const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), '.uploads');

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

function resolveLocalFile(key: string): string | null {
  if (!key || key.includes('..')) return null;
  const normalized = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, '');
  const absolute = path.resolve(LOCAL_UPLOAD_ROOT, normalized);
  if (!absolute.startsWith(LOCAL_UPLOAD_ROOT)) return null;
  return absolute;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const key = segments.join('/');
  const filePath = resolveLocalFile(key);
  if (!filePath) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const contentType = EXT_TO_MIME[ext] ?? 'application/octet-stream';
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': R2_OBJECT_CACHE_CONTROL,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
