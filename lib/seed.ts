import { db } from './db';

// Keep in sync with prisma/seeder/data/categories.js (single source for DB seed)
const { CATEGORIES_DATA } = require('../prisma/seeder/data/categories.js') as {
  CATEGORIES_DATA: { name: string; slug: string; color: string }[];
};

let seeded = false;

export async function seedDatabase() {
  if (seeded) return;
  seeded = true;

  try {
    for (let i = 0; i < CATEGORIES_DATA.length; i++) {
      const cat = CATEGORIES_DATA[i];
      const existing = await db.category.findUnique({ where: { slug: cat.slug } });
      if (!existing) {
        await db.category.create({
          data: { name: cat.name, slug: cat.slug, color: cat.color, isActive: true, sortOrder: i },
        });
      }
    }
  } catch (e) {
    console.error('Seed error:', e);
  }
}
