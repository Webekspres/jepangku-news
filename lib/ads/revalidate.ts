import { revalidateTag } from 'next/cache';
import { AD_SLOTS_CACHE_TAG } from '@/lib/ads/cache';

export function revalidateAdSlots(slot?: string): void {
  revalidateTag(AD_SLOTS_CACHE_TAG, 'max');
  if (slot) {
    revalidateTag(`ad-slot-${slot}`, 'max');
  }
}
