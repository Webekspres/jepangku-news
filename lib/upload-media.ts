import { parseApiResponse } from '@/lib/fetch-api';
import { parseUploadApiResponse } from '@/lib/upload-errors';
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

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: fd,
    credentials: 'same-origin',
  });
  const data = await parseUploadApiResponse<UploadMediaResult & { error?: string }>(res);
  if (!res.ok) {
    throw new Error(data.error || 'Upload gagal');
  }
  return data as UploadMediaResult;
}

/**
 * Delete a previously uploaded object from Cloudflare R2.
 * Safe to fire-and-forget: external / non-R2 URLs are a no-op on the server.
 */
export async function deleteMediaFile(urlOrPath: string): Promise<void> {
  if (!urlOrPath) return;
  const res = await fetch('/api/upload', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: urlOrPath }),
  });
  if (!res.ok) {
    const data = await parseApiResponse(res).catch(() => ({}));
    throw new Error(data.error || data.message || 'Gagal menghapus gambar');
  }
}

// ---------------------------------------------------------------------------
// Staged uploads
//
// To avoid filling the R2 bucket with images that get replaced before a form is
// saved, files are NOT uploaded on selection. Instead they are "staged" locally
// as `blob:` object URLs (which render fine in <img>) and only uploaded to R2
// when the form is committed. When a staged file replaces an already-saved R2
// object, that old object is deleted right after the new one uploads.
// ---------------------------------------------------------------------------

type StagedEntry = {
  file: File;
  purpose: UploadPurpose;
  /** A real R2 URL this staged file is replacing (deleted once committed). */
  replacedUrl?: string;
};

const stagedRegistry = new Map<string, StagedEntry>();

/** Stage a file locally and return a `blob:` preview URL (no network call). */
export function stageFile(
  file: File,
  purpose: UploadPurpose = 'content',
  replacedUrl?: string,
): string {
  const blobUrl = URL.createObjectURL(file);
  stagedRegistry.set(blobUrl, { file, purpose, replacedUrl });
  return blobUrl;
}

export function isStagedUrl(url: string | null | undefined): boolean {
  return !!url && stagedRegistry.has(url);
}

/** The already-saved URL a staged file would replace, if any. */
export function getReplacedUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return stagedRegistry.get(url)?.replacedUrl;
}

/** Drop a staged file without uploading. Does NOT touch the replaced R2 object. */
export function discardStagedUrl(url: string | null | undefined): void {
  if (!url || !stagedRegistry.has(url)) return;
  stagedRegistry.delete(url);
  try {
    URL.revokeObjectURL(url);
  } catch {
    // ignore
  }
}

/**
 * Resolve a (possibly staged) URL to a real one. Uploads the staged file to R2,
 * deletes the object it replaced (best effort), and returns the new URL.
 * Non-staged values (real URLs, empty strings) are returned unchanged.
 */
export async function commitStagedUrl(
  url: string | null | undefined,
): Promise<string> {
  if (!url) return '';
  const entry = stagedRegistry.get(url);
  if (!entry) return url;

  const { url: realUrl } = await uploadMediaFile(entry.file, entry.purpose);
  const { replacedUrl } = entry;
  discardStagedUrl(url);

  if (replacedUrl && replacedUrl !== realUrl) {
    deleteMediaFile(replacedUrl).catch(() => {
      // Orphan cleanup is best effort — never block the save on it.
    });
  }
  return realUrl;
}
