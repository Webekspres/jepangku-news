import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import {
  activeAdSlotWhere,
  serializePublicAdBanner,
} from '@/lib/ads/serialize';
import { AD_SLOTS_CACHE_TAG } from '@/lib/ads/cache';
import type { HomeAdResponse } from '@/lib/home/types';

async function loadHomeAd(slot: string): Promise<HomeAdResponse> {
  const banner = await db.adSlot.findFirst({
    where: activeAdSlotWhere(slot),
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return {
    slot,
    banner: banner ? serializePublicAdBanner(banner) : null,
  };
}

export async function fetchHomeAd(slot: string): Promise<HomeAdResponse> {
  return unstable_cache(
    () => loadHomeAd(slot),
    ['home-ad-slot', slot],
    { revalidate: 300, tags: [AD_SLOTS_CACHE_TAG, `ad-slot-${slot}`] },
  )();
}
