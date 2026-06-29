/**
 * Returns the value only when it is a safe http(s) absolute URL or a
 * root-relative path. Anything else (e.g. `javascript:` / `data:` URIs)
 * collapses to "" so it cannot become an XSS vector when used as an
 * element `src` / `href`.
 */
export function safeImageSrc(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("/")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "";
}
