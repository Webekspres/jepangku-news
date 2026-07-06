import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { auditAdminEntity } from '@/lib/audit-routes';
import {
  deleteNewsletterSubscription,
  listNewsletterSubscriptions,
} from '@/lib/newsletter';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return apiError('Admin access required' , { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20)));
  const statusParam = searchParams.get('status');
  const status =
    statusParam === 'active' || statusParam === 'inactive' ? statusParam : 'all';
  const search = searchParams.get('search') ?? undefined;

  const data = await listNewsletterSubscriptions({ page, pageSize, status, search });
  return apiSuccess(data);
}

export async function DELETE(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return apiError('Admin access required' , { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id.trim() : '';
  if (!id) {
    return apiError('ID wajib diisi' , { status: 400 });
  }

  const deleted = await deleteNewsletterSubscription(id);
  if (!deleted) {
    return apiError('Langganan tidak ditemukan' , { status: 404 });
  }

  auditAdminEntity(admin, 'newsletter_subscription', 'delete', {
    type: 'newsletter_subscription',
    id,
    label: 'Newsletter subscriber',
    href: '/admin/newsletter',
  });

  return apiSuccess({ ok: true });
}
