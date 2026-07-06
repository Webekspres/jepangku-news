import { NextResponse } from "next/server";
import { apiSuccess } from '@/lib/api-response';
import { fetchHomeEngagement } from "@/lib/home/queries/engagement";

export async function GET(): Promise<NextResponse> {
  const data = await fetchHomeEngagement();

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
    } });
}
