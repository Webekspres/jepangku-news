import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditAdminEntity } from '@/lib/audit-routes';
import { createAdminSlug } from '@/lib/slug';
import { MAX_NAVBAR_CATEGORIES } from '@/lib/categories/constants';
import { countNavbarCategories } from '@/lib/categories/navbar';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { articles: true } } },
  });

  return apiSuccess(
    categories.map((c) => ({ ...c, articleCount: c._count.articles })),
  );
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { name, description, showInNavbar } = await request.json();
  if (!name?.trim()) return apiError('Name is required' , { status: 400 });

  if (showInNavbar === true) {
    const navbarCount = await countNavbarCategories();
    if (navbarCount >= MAX_NAVBAR_CATEGORIES) {
      return apiSuccess(
        { error: `Maksimal ${MAX_NAVBAR_CATEGORIES} kategori di navbar` },
        { status: 400 },
      );
    }
  }

  const slug = createAdminSlug(name.trim());

  const existing = await db.category.findFirst({
    where: { OR: [{ slug }, { name: name.trim() }] },
  });
  if (existing) {
    return apiError('Kategori dengan nama tersebut sudah ada' , { status: 400 });
  }

  const category = await db.category.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      isActive: true,
      showInNavbar: Boolean(showInNavbar),
    },
  });

  auditAdminEntity(admin, 'category', 'create', { type: 'category', id: category.id, label: category.name, href: '/admin/categories' });

  return apiSuccess(category, { status: 201 });
}
