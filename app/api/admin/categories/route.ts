import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditAdminEntity } from '@/lib/audit-routes';
import { createAdminSlug } from '@/lib/slug';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { articles: true } } },
  });

  return NextResponse.json(
    categories.map((c) => ({ ...c, articleCount: c._count.articles })),
  );
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { name, description, iconUrl, color } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const slug = createAdminSlug(name.trim());

  const existing = await db.category.findFirst({
    where: { OR: [{ slug }, { name: name.trim() }] },
  });
  if (existing) {
    return NextResponse.json({ error: 'Kategori dengan nama tersebut sudah ada' }, { status: 400 });
  }

  const category = await db.category.create({
    data: { name: name.trim(), slug, description: description?.trim() || null, iconUrl: iconUrl?.trim() || null, color: color?.trim() || null, isActive: true },
  });

  auditAdminEntity(admin, 'category', 'create', { type: 'category', id: category.id, label: category.name, href: '/admin/categories' });

  return NextResponse.json(category, { status: 201 });
}
