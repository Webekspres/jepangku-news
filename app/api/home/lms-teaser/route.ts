import { NextResponse } from "next/server";
import { fetchHomeLmsTeaser } from "@/lib/home/queries/lms-teaser";
import type { HomeLmsTeaserResponse } from "@/lib/home/types";

export async function GET(): Promise<NextResponse<HomeLmsTeaserResponse>> {
  const data = await fetchHomeLmsTeaser();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}
