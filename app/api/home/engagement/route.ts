import { apiSuccess } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { fetchHomeEngagement } from "@/lib/home/queries/engagement";
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async () => {
  const start = Date.now();
  const data = await fetchHomeEngagement();

  logger.info('home.engagement.completed', { section: 'engagement', durationMs: Date.now() - start });

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
    } });
});

export { GET };
