import { NextResponse } from "next/server";
import { apiError, apiSuccess } from '@/lib/api-response';
import { fetchHomeCategoriesEditorial } from "@/lib/home/queries/categories-editorial";
import type { HomeCategoriesEditorialResponse } from "@/lib/home/types";

export async function GET(): Promise<NextResponse> {
  const data = await fetchHomeCategoriesEditorial();

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
    } });
}
