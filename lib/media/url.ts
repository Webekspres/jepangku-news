/** Hostname dari R2_PUBLIC_URL (server / build time). */
export function getR2PublicHostname(): string | null {
  const raw = process.env.R2_PUBLIC_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

export function isR2MediaUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    if (hostname.endsWith('.r2.dev')) return true;
    if (hostname.endsWith('.r2.cloudflarestorage.com')) return true;
    const publicHost = getR2PublicHostname();
    return Boolean(publicHost && hostname === publicHost);
  } catch {
    return false;
  }
}

/** Local dev fallback prefix used by uploadToLocal() / mock file route. */
const LOCAL_MOCK_PREFIX = '/api/files/mock/';

/**
 * Derive the R2 object key (storage path) from a stored media URL or path.
 * Returns null when the value is not an R2-owned object we can safely delete.
 */
export function extractR2Key(urlOrPath: string | null | undefined): string | null {
  if (!urlOrPath) return null;
  const value = urlOrPath.trim();
  if (!value) return null;

  if (value.startsWith(LOCAL_MOCK_PREFIX)) {
    const key = decodeURIComponent(value.slice(LOCAL_MOCK_PREFIX.length));
    return key || null;
  }

  // Absolute URL — only treat as deletable when it points at our R2 bucket.
  if (/^https?:\/\//i.test(value)) {
    if (!isR2MediaUrl(value)) return null;
    try {
      const { pathname } = new URL(value);
      const key = decodeURIComponent(pathname.replace(/^\/+/, ''));
      return key || null;
    } catch {
      return null;
    }
  }

  // Bare storage key (already a path inside the bucket).
  if (value.startsWith('portal-berita/')) {
    return value.replace(/^\/+/, '') || null;
  }

  return null;
}
