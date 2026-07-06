import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditAdminEntity } from '@/lib/audit-routes';
import { createAdminSlug } from '@/lib/slug';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const tags = await db.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  });

  return apiSuccess(tags.map((t: typeof tags[number]) => ({ ...t, usageCount: t._count.articles })));
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { name } = await request.json();
  if (!name) return apiError('Name is required' , { status: 400 });

  const slug = createAdminSlug(name.trim());

  const existing = await db.tag.findFirst({ where: { OR: [{ slug }, { name: name.trim() }] } });
  if (existing) return apiError('Tag already exists' , { status: 400 });

  const tag = await db.tag.create({ data: { name: name.trim(), slug } });

  auditAdminEntity(admin, 'tag', 'create', { type: 'tag', id: tag.id, label: tag.name, href: '/admin/tags' });

  return apiSuccess(tag, { status: 201 });
}
