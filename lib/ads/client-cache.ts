import type { HomeAdResponse } from '@/lib/home/types';
import { AD_SLOT_CLIENT_TTL_MS } from '@/lib/ads/cache';
import { preloadMediaImage } from '@/lib/media/client-cache';

type CacheEntry = {
  data: HomeAdResponse;
  fetchedAt: number;
};

const memoryCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<HomeAdResponse>>();

export function adSlotEndpoint(slot: string): string {
  return `/api/home/ads?slot=${encodeURIComponent(slot)}`;
}

/** @deprecated Gunakan preloadMediaImage dari lib/media/client-cache */
export function preloadAdBannerImage(imageUrl: string | null | undefined): void {
  preloadMediaImage(imageUrl);
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
