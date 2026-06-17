import type { HomeAdResponse } from '@/lib/home/types';
import { AD_SLOT_CLIENT_TTL_MS } from '@/lib/ads/cache';

type CacheEntry = {
  data: HomeAdResponse;
  fetchedAt: number;
};

const memoryCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<HomeAdResponse>>();
const preloadedImages = new Set<string>();

export function adSlotEndpoint(slot: string): string {
  return `/api/home/ads?slot=${encodeURIComponent(slot)}`;
}

/** Warm browser image cache — idempotent per URL per session. */
export function preloadAdBannerImage(imageUrl: string | null | undefined): void {
  if (!imageUrl || typeof window === 'undefined' || preloadedImages.has(imageUrl)) return;
  preloadedImages.add(imageUrl);
  const img = new window.Image();
  img.decoding = 'async';
  img.src = imageUrl;
}

function readCache(slot: string): HomeAdResponse | null {
  const entry = memoryCache.get(slot);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > AD_SLOT_CLIENT_TTL_MS) {
    memoryCache.delete(slot);
    return null;
  }
  return entry.data;
}

function writeCache(slot: string, data: HomeAdResponse): HomeAdResponse {
  memoryCache.set(slot, { data, fetchedAt: Date.now() });
  preloadAdBannerImage(data.banner?.imageUrl);
  return data;
}

/** Fetch ad slot with in-memory cache + in-flight deduplication. */
export async function fetchAdSlotClient(
  slot: string,
  init?: RequestInit,
): Promise<HomeAdResponse> {
  const cached = readCache(slot);
  if (cached) return cached;

  const pending = inFlight.get(slot);
  if (pending) return pending;

  const promise = fetch(adSlotEndpoint(slot), {
    cache: 'force-cache',
    ...init,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<HomeAdResponse>;
    })
    .then((data) => writeCache(slot, data))
    .finally(() => {
      inFlight.delete(slot);
    });

  inFlight.set(slot, promise);
  return promise;
}

export function peekAdSlotClient(slot: string): HomeAdResponse | null {
  return readCache(slot);
}

export function invalidateAdSlotClientCache(slot?: string): void {
  if (slot) {
    memoryCache.delete(slot);
    inFlight.delete(slot);
    return;
  }
  memoryCache.clear();
  inFlight.clear();
}
