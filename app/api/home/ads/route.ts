import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from '@/lib/api-response';
import { isValidAdSlotPosition } from "@/lib/ads/constants";
import { fetchHomeAd } from "@/lib/home/queries/ads";
import type { HomeAdResponse } from "@/lib/home/types";

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const slot = searchParams.get("slot") || "homepage-mid";

  if (!isValidAdSlotPosition(slot)) {
    return apiError("Invalid slot" , { status: 400 });
  }

  const data = await fetchHomeAd(slot);

  return apiSuccess(data, { headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    } });
}
