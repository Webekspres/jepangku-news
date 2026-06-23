import { parseApiResponse } from '@/lib/fetch-api';
export type UploadPurpose = 'avatar' | 'cover' | 'content' | 'banner';

export type UploadMediaResult = {
  url: string;
  path: string;
};

export async function uploadMediaFile(
  file: File,
  purpose: UploadPurpose = 'content',
): Promise<UploadMediaResult> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('purpose', purpose);

  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await parseApiResponse(res);
  if (!res.ok) {
    throw new Error(data.error || 'Upload gagal');
  }
  return data as UploadMediaResult;
}
