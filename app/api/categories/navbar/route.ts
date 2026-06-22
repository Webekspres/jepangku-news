import { NextResponse } from 'next/server';
import { getNavbarCategories } from '@/lib/categories/navbar';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  await seedDatabase();
  const categories = await getNavbarCategories();
  return NextResponse.json(categories);
}
