import { NextResponse } from "next/server";
import { apiSuccess } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { fetchHomeFeed } from "@/lib/home/queries/feed";


export async function GET(): Promise<NextResponse> {
  const start = Date.now();
  const data = await fetchHomeFeed();

  logger.info('home.feed.completed', { section: 'feed', durationMs: Date.now() - start });

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
    } });
}
