import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { auditAdminEntity } from '@/lib/audit-routes';
import { db } from '@/lib/db';
import { createAdminSlug } from '@/lib/slug';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;
  const { name } = await request.json();

  if (!name?.trim()) {
    return apiError('Name is required' , { status: 400 });
  }

  const tag = await db.tag.findUnique({ where: { id } });
  if (!tag) return apiError('Tag not found' , { status: 404 });

  if (name.trim() !== tag.name) {
    const slug = createAdminSlug(name.trim());
    const existing = await db.tag.findFirst({
      where: { OR: [{ slug }, { name: name.trim() }], NOT: { id } },
    });
    if (existing) {
      return apiError('Tag already exists' , { status: 400 });
    }
  }

  const updated = await db.tag.update({
    where: { id },
    data: { name: name.trim(), slug: createAdminSlug(name.trim()) },
  });

  auditAdminEntity(admin, 'tag', 'update', {
    type: 'tag',
    id: updated.id,
    label: updated.name,
    href: '/admin/tags',
  });

  return apiSuccess(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;

  const tag = await db.tag.findUnique({ where: { id } });
  if (!tag) return apiError('Tag not found' , { status: 404 });

  const usage = await db.articleTag.count({ where: { tagId: id } });
  if (usage > 0) {
    return apiSuccess({ error: `Tag is used by ${usage} article(s)` }, { status: 400 });
  }

  auditAdminEntity(admin, 'tag', 'delete', { type: 'tag', id: tag.id, label: tag.name, href: '/admin/tags' });

  await db.tag.delete({ where: { id } });
  return apiSuccess({ message: 'Tag deleted' });
}
