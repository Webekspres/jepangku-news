import { NextResponse } from "next/server";
import { apiSuccess } from '@/lib/api-response';
import { fetchHomeReactions } from "@/lib/home/queries/reactions";

export async function GET(): Promise<NextResponse> {
  const data = await fetchHomeReactions();

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
    } });
}
