import { NextResponse } from "next/server";
import { fetchHomeFeed } from "@/lib/home/queries/feed";
import type { HomeFeedResponse } from "@/lib/home/types";

export async function GET(): Promise<NextResponse<HomeFeedResponse>> {
  const data = await fetchHomeFeed();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
    },
  });
}
