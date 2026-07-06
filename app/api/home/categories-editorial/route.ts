import { fetchHomeCategoriesEditorial } from "@/lib/home/queries/categories-editorial";

export async function GET(): Promise<NextResponse> {
  const data = await fetchHomeCategoriesEditorial();

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
    } });
}
