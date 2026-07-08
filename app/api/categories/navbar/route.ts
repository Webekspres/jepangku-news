
import { apiSuccess } from '@/lib/api-response';
import { getNavbarCategories } from '@/lib/categories/navbar';
import { seedDatabase } from '@/lib/seed';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async () => {
  await seedDatabase();
  const categories = await getNavbarCategories();
  return apiSuccess(categories);
});

export { GET };
