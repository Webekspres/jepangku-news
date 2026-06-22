/** Placeholder lokal untuk card tanpa thumbnail valid. */
export const CARD_PLACEHOLDER = "/assets/images/placeholder/card-placeholder.svg";

export function isValidMediaUrl(value: unknown): value is string {
  if (value == null || value === "") return false;
  const url = String(value).trim();
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Kembalikan URL gambar card atau placeholder bila kosong / tidak valid. */
export function resolveCardImageUrl(value?: string | null): string {
  return isValidMediaUrl(value) ? value : CARD_PLACEHOLDER;
}

export function resolveThumbnailUrl(item: {
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  coverImageUrl?: string | null;
  cover_image_url?: string | null;
}): string {
  const raw =
    item.thumbnailUrl ??
    item.thumbnail_url ??
    item.coverImageUrl ??
    item.cover_image_url ??
    null;
  return resolveCardImageUrl(raw);
}
