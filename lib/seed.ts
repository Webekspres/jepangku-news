import { db } from './db';
import { hashPassword } from './auth';

const CATEGORIES = [
  { name: 'Anime', slug: 'anime', color: '#D90429' },
  { name: 'Manga', slug: 'manga', color: '#0A0A0A' },
  { name: 'Culture', slug: 'culture', color: '#D90429' },
  { name: 'Travel', slug: 'travel', color: '#0A0A0A' },
  { name: 'Food', slug: 'food', color: '#D90429' },
  { name: 'Event', slug: 'event', color: '#0A0A0A' },
  { name: 'Technology', slug: 'technology', color: '#D90429' },
  { name: 'Lifestyle', slug: 'lifestyle', color: '#0A0A0A' },
  { name: 'Education', slug: 'education', color: '#D90429' },
  { name: 'Fun', slug: 'fun', color: '#0A0A0A' },
];

let seeded = false;

export async function seedDatabase() {
  if (seeded) return;
  seeded = true;

  try {
    // Seed admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jepangku.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'JepangkuAdmin2025!';

    const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashed = await hashPassword(adminPassword);
      await db.user.create({
        data: {
          email: adminEmail,
          username: 'admin',
          passwordHash: hashed,
          name: 'Admin Jepangku',
          role: 'ADMIN',
          status: 'active',
          totalPoints: 0,
          profile: {
            create: { displayName: 'Admin Jepangku' },
          },
        },
      });
      console.log('Admin user seeded:', adminEmail);
    }

    // Seed categories
    for (let i = 0; i < CATEGORIES.length; i++) {
      const cat = CATEGORIES[i];
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
