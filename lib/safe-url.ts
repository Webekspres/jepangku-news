/**
 * Returns the value only when it is a safe http(s) absolute URL or a
 * root-relative path. Anything else (e.g. `javascript:` / `data:` URIs)
 * collapses to "" so it cannot become an XSS vector when used as an
 * element `src` / `href`.
 *
 * The value must match {@link SAFE_URL_RE} in full. That allowlist excludes
 * every HTML metacharacter (`<`, `>`, `"`, `'`, backtick, whitespace), so the
 * result can never break out of an HTML attribute. The fully-anchored test
 * also acts as a sanitizing guard recognised by static analysis (CodeQL).
 */
const SAFE_URL_RE = /^[A-Za-z0-9\-._~:/?#[\]@!$&()*+,;=%]+$/;

export function safeImageSrc(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();

  // Reject anything containing characters that could break out of an
  // attribute before we ever return the value.
  if (!SAFE_URL_RE.test(trimmed)) return "";

  if (trimmed.startsWith("/")) return trimmed;
  if (trimmed.startsWith("blob:")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "";
}
