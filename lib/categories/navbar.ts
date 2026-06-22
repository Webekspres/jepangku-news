import { db } from '@/lib/db';
import { MAX_NAVBAR_CATEGORIES } from '@/lib/categories/constants';

export type NavbarCategory = {
  name: string;
  slug: string;
};

export async function getNavbarCategories(): Promise<NavbarCategory[]> {
  return db.category.findMany({
    where: { isActive: true, showInNavbar: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    take: MAX_NAVBAR_CATEGORIES,
    select: { name: true, slug: true },
  });
}

export async function countNavbarCategories(excludeId?: string): Promise<number> {
  return db.category.count({
    where: {
      showInNavbar: true,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}
