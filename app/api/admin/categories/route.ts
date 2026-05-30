import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { createAdminSlug } from '@/lib/slug';

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { name, description, iconUrl, color } = await request.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const slug = createAdminSlug(name);
  const category = await db.category.create({
    data: { name, slug, description, iconUrl, color, isActive: true },
  });

  return NextResponse.json(category, { status: 201 });
}
