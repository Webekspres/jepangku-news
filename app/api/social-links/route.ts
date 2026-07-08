
import { apiSuccess } from '@/lib/api-response';
import { getPublicSocialLinks } from "@/lib/social-links";
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async () => {
  const links = await getPublicSocialLinks();
  return apiSuccess(
    { links },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
});

export { GET };
