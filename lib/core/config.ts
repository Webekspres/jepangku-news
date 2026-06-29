/** Jepangku Core Service — env helpers (server-only). */

/** Normalize CORE_API_URL — nginx prod redirects HTTP→HTTPS; POST on 301 becomes GET → 404. */
function normalizeCoreApiUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, '');
  try {
    const url = new URL(trimmed);
    if (url.protocol === 'http:' && url.hostname === 'core.jepangku.com') {
      url.protocol = 'https:';
      return url.toString().replace(/\/$/, '');
    }
  } catch {
    // Not a valid absolute URL — leave as-is.
  }
  return trimmed;
}

export function getCoreApiUrl(): string | null {
  const url = process.env.CORE_API_URL?.trim();
  return url ? normalizeCoreApiUrl(url) : null;
}

export function getCoreServiceToken(): string | null {
  return process.env.CORE_SERVICE_TOKEN?.trim() || null;
}

export function isCoreApiConfigured(): boolean {
  return Boolean(getCoreApiUrl());
}

export function isCoreAwardConfigured(): boolean {
  return Boolean(getCoreApiUrl() && getCoreServiceToken());
}

export const CORE_APPLICATION_PORTAL = 'PORTAL_BERITA' as const;
