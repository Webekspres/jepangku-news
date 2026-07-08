
import { apiSuccess } from '@/lib/api-response';
import { db } from '@/lib/db';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async () => {
  const tags = await db.tag.findMany({ orderBy: { name: 'asc' } });
  return apiSuccess(tags);
});

export { GET };
