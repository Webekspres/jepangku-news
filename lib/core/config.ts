/** Jepangku Core Service — env helpers (server-only). */

export function getCoreApiUrl(): string | null {
  const url = process.env.CORE_API_URL?.trim();
  return url || null;
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
