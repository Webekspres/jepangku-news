/** Canonical site origin for metadata, OG tags, and share URLs. */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");


  return "http://localhost:3000";
}

/** Resolve relative asset paths to absolute URLs for OG / JSON-LD. */
export function toAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = getSiteUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function articlePageUrl(slug: string): string {
  return `${getSiteUrl()}/articles/${encodeURIComponent(slug)}`;
}
