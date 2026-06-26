export const AD_SLOTS_CACHE_TAG = 'ad-slots';

/** Client-side in-memory TTL — pendek agar perubahan iklan cepat tampil
 *  saat navigasi SPA. Refresh halaman selalu mengambil data segar (no-store). */
export const AD_SLOT_CLIENT_TTL_MS = 30 * 1000;

export function adSlotCacheKey(slot: string): string {
  return `ad-slot:${slot}`;
}
