import { NextRequest, NextResponse } from 'next/server';
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
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 });
  }

  const subscriptions = await listUserCategorySubscriptions(user.id);
  return NextResponse.json({ subscriptions });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const categoryId = await resolveCategoryId(
    typeof body?.categoryId === 'string' ? body.categoryId : null,
    typeof body?.categorySlug === 'string' ? body.categorySlug : null,
  );

  if (!categoryId) {
    return NextResponse.json({ error: 'Kategori tidak valid' }, { status: 400 });
  }

  const result = await subscribeToCategory(user.id, categoryId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'Gagal berlangganan' }, {
      status: 400,
    });
  }

  return NextResponse.json({ ok: true, categoryId });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = await resolveCategoryId(
    searchParams.get('categoryId'),
    searchParams.get('categorySlug'),
  );

  if (!categoryId) {
    return NextResponse.json({ error: 'Kategori tidak valid' }, { status: 400 });
  }

  await unsubscribeFromCategory(user.id, categoryId);
  return NextResponse.json({ ok: true });
}
