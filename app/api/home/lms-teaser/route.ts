import { apiSuccess } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { fetchHomeLmsTeaser } from "@/lib/home/queries/lms-teaser";
import { withRequestLogging } from '@/lib/logging/request-logger';


const GET = withRequestLogging(async () => {
  const start = Date.now();
  const data = await fetchHomeLmsTeaser();

  logger.info('home.lms_teaser.completed', { section: 'lms-teaser', durationMs: Date.now() - start });

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    } });
});

export { GET };
