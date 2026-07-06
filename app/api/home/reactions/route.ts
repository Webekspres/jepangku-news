import { NextResponse } from "next/server";
import { apiSuccess } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { fetchHomeReactions } from "@/lib/home/queries/reactions";

export async function GET(): Promise<NextResponse> {
  const start = Date.now();
  const data = await fetchHomeReactions();

  logger.info('home.reactions.completed', { section: 'reactions', durationMs: Date.now() - start });

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
    } });
}
