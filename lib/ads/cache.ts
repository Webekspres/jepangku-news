export const AD_SLOTS_CACHE_TAG = 'ad-slots';

/** Client-side in-memory TTL — selaras dengan revalidate server (5 menit). */
export const AD_SLOT_CLIENT_TTL_MS = 5 * 60 * 1000;

export function adSlotCacheKey(slot: string): string {
  return `ad-slot:${slot}`;
}
