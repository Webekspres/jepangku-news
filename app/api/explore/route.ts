import { apiSuccess } from "@/lib/api-response";
import { fetchExploreContent } from "@/lib/explore/queries";
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async () => {
  const data = await fetchExploreContent();

  return apiSuccess(data, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
    },
  });
});

export { GET };
