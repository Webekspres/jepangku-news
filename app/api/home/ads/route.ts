import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from '@/lib/api-response';
import { isValidAdSlotPosition, normalizeAdPosition } from "@/lib/ads/constants";
import { fetchHomeAd } from "@/lib/home/queries/ads";

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const rawSlot = searchParams.get("slot") || "center";
  const slot = normalizeAdPosition(rawSlot);

  if (!isValidAdSlotPosition(slot)) {
    return apiError("Invalid slot" , { status: 400 });
  }

  const data = await fetchHomeAd(slot);

  // Jangan cache di browser/CDN agar perubahan iklan dari admin langsung
  // tampil. Performa tetap terjaga oleh unstable_cache di server yang
  // di-revalidate setiap kali admin menyimpan.
  return apiSuccess(data, { headers: { 'Cache-Control': 'no-store' } });
}
