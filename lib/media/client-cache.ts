const preloaded = new Set<string>();

/** Warm browser HTTP cache — idempotent per URL per tab session. */
export function preloadMediaImage(url: string | null | undefined): void {
  if (!url || typeof window === 'undefined' || preloaded.has(url)) return;
  preloaded.add(url);
  const img = new window.Image();
  img.decoding = 'async';
  img.src = url;
}

export function clearMediaPreloadCache(url?: string): void {
  if (url) {
    preloaded.delete(url);
    return;
  }
  preloaded.clear();
}
