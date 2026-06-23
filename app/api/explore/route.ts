import { NextResponse } from "next/server";
import { apiSuccess } from "@/lib/api-response";
import { fetchExploreContent } from "@/lib/explore/queries";

export async function GET(): Promise<NextResponse> {
  const data = await fetchExploreContent();

  return apiSuccess(data, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
    },
  });
}
