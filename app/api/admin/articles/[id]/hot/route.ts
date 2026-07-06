import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { auditAdminEntity } from '@/lib/audit-routes';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;
  const { value } = await request.json();

  const article = await db.article.update({ where: { id }, data: { isHot: value } });

  auditAdminEntity(admin, 'article', 'set_hot', {
    type: 'article',
    id: article.id,
    label: article.title,
    href: `/admin/articles/${article.id}`,
  }, undefined, { isHot: article.isHot });

  return apiSuccess({ message: 'Updated', isHot: article.isHot });
}
