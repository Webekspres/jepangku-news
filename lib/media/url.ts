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
