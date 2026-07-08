import { apiSuccess } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { fetchHomeFeed } from "@/lib/home/queries/feed";
import { withRequestLogging } from '@/lib/logging/request-logger';


const GET = withRequestLogging(async () => {
  const start = Date.now();
  const data = await fetchHomeFeed();

  logger.info('home.feed.completed', { section: 'feed', durationMs: Date.now() - start });

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
    } });
});

export { GET };
