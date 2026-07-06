import { fetchHomeLmsTeaser } from "@/lib/home/queries/lms-teaser";

export async function GET(): Promise<NextResponse> {
  const data = await fetchHomeLmsTeaser();

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    } });
}
