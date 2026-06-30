import type { ArticleFormSnapshot } from '@/hooks/useAutosave';

/** Maks. ukuran file gambar untuk validasi client (5 MB). */
export const ARTICLE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const ARTICLE_IMAGE_MAX_LABEL = '5 MB';

export const ARTICLE_IMAGE_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
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
