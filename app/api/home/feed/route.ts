import { fetchHomeFeed } from "@/lib/home/queries/feed";

export async function GET(): Promise<NextResponse> {
  const data = await fetchHomeFeed();

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
    } });
}
