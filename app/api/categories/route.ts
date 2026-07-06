
import { apiSuccess } from '@/lib/api-response';
import { db } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  await seedDatabase();
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  return apiSuccess(categories);
}
