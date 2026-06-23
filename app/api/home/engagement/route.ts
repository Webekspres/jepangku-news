import { NextResponse } from "next/server";
import { apiError, apiSuccess } from '@/lib/api-response';
import { fetchHomeEngagement } from "@/lib/home/queries/engagement";
import type { HomeEngagementResponse } from "@/lib/home/types";

export async function GET(): Promise<NextResponse> {
  const data = await fetchHomeEngagement();

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
    } });
}
