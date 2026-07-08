import { apiSuccess } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { fetchHomeCategoriesEditorial } from "@/lib/home/queries/categories-editorial";
import { withRequestLogging } from '@/lib/logging/request-logger';


const GET = withRequestLogging(async () => {
  const start = Date.now();
  const data = await fetchHomeCategoriesEditorial();

  logger.info('home.categories_editorial.completed', { section: 'categories-editorial', durationMs: Date.now() - start });

  return apiSuccess(data, { headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
    } });
});

export { GET };
