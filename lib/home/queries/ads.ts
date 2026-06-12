import { db } from "@/lib/db";
import {
  activeAdSlotWhere,
  serializePublicAdBanner,
} from "@/lib/ads/serialize";
import type { HomeAdResponse } from "@/lib/home/types";

export async function fetchHomeAd(slot: string): Promise<HomeAdResponse> {
  const banner = await db.adSlot.findFirst({
    where: activeAdSlotWhere(slot),
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return {
    slot,
    banner: banner ? serializePublicAdBanner(banner) : null,
  };
}
