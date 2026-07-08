
import { apiSuccess } from '@/lib/api-response';
import { db } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async () => {
  await seedDatabase();
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  return apiSuccess(categories);
});

export { GET };
