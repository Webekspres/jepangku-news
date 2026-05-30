import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/categories/[slug]'>
) {
  const { slug } = await ctx.params;

  try {
    const category = await db.category.findUnique({ where: { slug } });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ category });
  } catch (err) {
    console.error('[category/slug]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
