import { NextResponse } from "next/server";
import { fetchHomeCategoriesEditorial } from "@/lib/home/queries/categories-editorial";
import type { HomeCategoriesEditorialResponse } from "@/lib/home/types";

export async function GET(): Promise<
  NextResponse<HomeCategoriesEditorialResponse>
> {
  const data = await fetchHomeCategoriesEditorial();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
    },
  });
}
