import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import {
  listUserCategorySubscriptions,
  resolveCategoryId,
  subscribeToCategory,
  unsubscribeFromCategory,
} from '@/lib/category-subscriptions';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Login diperlukan' , { status: 401 });
  }

  const subscriptions = await listUserCategorySubscriptions(user.id);
  return apiSuccess({ subscriptions });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Login diperlukan' , { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const categoryId = await resolveCategoryId(
    typeof body?.categoryId === 'string' ? body.categoryId : null,
    typeof body?.categorySlug === 'string' ? body.categorySlug : null,
  );

  if (!categoryId) {
    return apiError('Kategori tidak valid' , { status: 400 });
  }

  const result = await subscribeToCategory(user.id, categoryId);
  if (!result.ok) {
    return apiError(result.error ?? 'Gagal berlangganan' , { status: 400 });
  }

  return apiSuccess({ ok: true, categoryId });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Login diperlukan' , { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = await resolveCategoryId(
    searchParams.get('categoryId'),
    searchParams.get('categorySlug'),
  );

  if (!categoryId) {
    return apiError('Kategori tidak valid' , { status: 400 });
  }

  await unsubscribeFromCategory(user.id, categoryId);
  return apiSuccess({ ok: true });
}
