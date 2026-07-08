import { NextRequest } from "next/server";
import { apiError, apiSuccess } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { isValidAdSlotPosition, normalizeAdPosition } from "@/lib/ads/constants";
import { fetchHomeAd } from "@/lib/home/queries/ads";
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async (
  request: NextRequest,
) => {
  const start = Date.now();
  const { searchParams } = new URL(request.url);
  const rawSlot = searchParams.get("slot") || "center";
  const slot = normalizeAdPosition(rawSlot);

  if (!isValidAdSlotPosition(slot)) {
    logger.warn('home.ads.invalid_slot', { slot: rawSlot, durationMs: Date.now() - start });
    return apiError("Invalid slot" , { status: 400 });
  }

  const data = await fetchHomeAd(slot);

  logger.info('home.ads.completed', { section: 'ads', slot, durationMs: Date.now() - start });

  // Jangan cache di browser/CDN agar perubahan iklan dari admin langsung
  // tampil. Performa tetap terjaga oleh unstable_cache di server yang
  // di-revalidate setiap kali admin menyimpan.
  return apiSuccess(data, { headers: { 'Cache-Control': 'no-store' } });
});

export { GET };
