import { NextResponse } from "next/server";
import { apiSuccess } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { fetchHomeTv } from "@/lib/home/queries/tv";


export async function GET(): Promise<NextResponse> {
  const start = Date.now();
  const data = await fetchHomeTv();

  logger.info('home.tv.completed', { section: 'tv', durationMs: Date.now() - start });

  return apiSuccess(data, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
    },
  });
}
