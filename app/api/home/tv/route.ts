import { NextResponse } from "next/server";
import { apiError, apiSuccess } from '@/lib/api-response';
import { fetchHomeTv } from "@/lib/home/queries/tv";
import type { HomeTvResponse } from "@/lib/home/types";

export async function GET(): Promise<NextResponse> {
  const data = await fetchHomeTv();

  return apiSuccess(data, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
    },
  });
}
