import { NextResponse } from "next/server";
import { apiError, apiSuccess } from '@/lib/api-response';
import { fetchHomeFeed } from "@/lib/home/queries/feed";
import type { HomeFeedResponse } from "@/lib/home/types";

export async function GET(): Promise<NextResponse> {
  const data = await fetchHomeFeed();

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
    } });
}
