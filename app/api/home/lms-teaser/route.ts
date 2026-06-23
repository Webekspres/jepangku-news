import { NextResponse } from "next/server";
import { apiError, apiSuccess } from '@/lib/api-response';
import { fetchHomeLmsTeaser } from "@/lib/home/queries/lms-teaser";
import type { HomeLmsTeaserResponse } from "@/lib/home/types";

export async function GET(): Promise<NextResponse> {
  const data = await fetchHomeLmsTeaser();

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    } });
}
