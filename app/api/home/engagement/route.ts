import { NextResponse } from "next/server";
import { fetchHomeEngagement } from "@/lib/home/queries/engagement";
import type { HomeEngagementResponse } from "@/lib/home/types";

export async function GET(): Promise<NextResponse<HomeEngagementResponse>> {
  const data = await fetchHomeEngagement();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
    },
  });
}
