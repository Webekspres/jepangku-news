import type { ArticleFormSnapshot } from '@/hooks/useAutosave';

export type ArticleImagePurpose = 'avatar' | 'cover' | 'content' | 'banner';

/** Maks. ukuran file gambar untuk validasi client (5 MB). */
export const ARTICLE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const ARTICLE_IMAGE_MAX_LABEL = '5 MB';

/** Batas dimensi per sisi agar upload tidak gagal di server (px). */
export const ARTICLE_IMAGE_HARD_MAX_DIMENSION = 8000;

export const ARTICLE_IMAGE_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export const ARTICLE_IMAGE_ACCEPT = ARTICLE_IMAGE_ALLOWED_TYPES.join(',');

/** Dimensi target setelah optimasi server — ditampilkan sebagai panduan pengguna. */
export const ARTICLE_IMAGE_TARGET_DIMENSIONS: Record<
  ArticleImagePurpose,
  { maxWidth: number; maxHeight: number }
> = {
  cover: { maxWidth: 1600, maxHeight: 1200 },
  content: { maxWidth: 1200, maxHeight: 1200 },
  avatar: { maxWidth: 400, maxHeight: 400 },
  banner: { maxWidth: 1920, maxHeight: 576 },
};

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

export function getArticleImageUploadHint(
  purpose: ArticleImagePurpose = 'content',
): string {
  const { maxWidth, maxHeight } = ARTICLE_IMAGE_TARGET_DIMENSIONS[purpose];
  return `Format: JPG, PNG, GIF, WebP · Maks. ${ARTICLE_IMAGE_MAX_LABEL} · Disarankan maks. ${maxWidth}×${maxHeight} px (dioptimalkan otomatis saat disimpan)`;
}

export async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        reject(new Error('Gagal membaca gambar'));
      };
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function validateArticleImageFile(file: File): string | null {
  if (!ARTICLE_IMAGE_ALLOWED_TYPES.includes(file.type as (typeof ARTICLE_IMAGE_ALLOWED_TYPES)[number])) {
    return 'Format harus JPG, PNG, GIF, atau WebP';
  }
  if (file.size > ARTICLE_IMAGE_MAX_BYTES) {
    return `Ukuran file melebihi batas maksimal (${ARTICLE_IMAGE_MAX_LABEL}). File Anda: ${formatFileSize(file.size)}.`;
  }
  return null;
}

export function validateArticleImageDimensions(
  width: number,
  height: number,
): string | null {
  const max = ARTICLE_IMAGE_HARD_MAX_DIMENSION;
  if (width > max || height > max) {
    return `Dimensi gambar terlalu besar (${width}×${height} px). Maksimal ${max}×${max} px per sisi — kompres atau ubah ukuran gambar terlebih dahulu.`;
  }
  return null;
}

/** Validasi format, ukuran file, dan dimensi sebelum upload/staging. */
export async function validateArticleImageFileFull(
  file: File,
  purpose: ArticleImagePurpose = 'content',
): Promise<string | null> {
  const basic = validateArticleImageFile(file);
  if (basic) return basic;

  try {
    const { width, height } = await readImageDimensions(file);
    const dimensionError = validateArticleImageDimensions(width, height);
    if (dimensionError) return dimensionError;

    const { maxWidth, maxHeight } = ARTICLE_IMAGE_TARGET_DIMENSIONS[purpose];
    if (width > maxWidth || height > maxHeight) {
      // Bukan error — server akan resize; hint sudah di UI.
      return null;
    }
  } catch {
    return 'File gambar tidak valid atau rusak. Coba pilih file lain.';
  }

  return null;
}

/** Hilangkan URL sementara (blob:) agar tidak tersimpan di localStorage / draft server. */
export function sanitizeArticleSnapshot(
  data: ArticleFormSnapshot,
): ArticleFormSnapshot {
  const coverImageUrl =
    data.coverImageUrl.startsWith('blob:') ? '' : data.coverImageUrl;
  return { ...data, coverImageUrl };
}

export function buildDraftPayload(
  clientId: string,
  data: ArticleFormSnapshot,
  status: string,
) {
  const sanitized = sanitizeArticleSnapshot(data);
  return {
    id: clientId,
    title: sanitized.title,
    excerpt: sanitized.excerpt,
    content: sanitized.content,
    coverImageUrl: sanitized.coverImageUrl || null,
    categoryId: sanitized.categoryId || null,
    tags: sanitized.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    status,
  };
}

export function normaliseTags(
  raw:
    | string
    | { name?: string; [k: string]: unknown }[]
    | string[]
    | undefined
    | null,
): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  return raw
    .map((t) =>
      typeof t === 'string' ? t : (t as { name?: string }).name ?? '',
    )
    .filter(Boolean)
    .join(', ');
}
