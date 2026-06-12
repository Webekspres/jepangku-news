import { NextResponse } from "next/server";
import { fetchHomeReactions } from "@/lib/home/queries/reactions";
import type { HomeReactionsResponse } from "@/lib/home/types";

export async function GET(): Promise<NextResponse<HomeReactionsResponse>> {
  const data = await fetchHomeReactions();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
    },
  });
}
