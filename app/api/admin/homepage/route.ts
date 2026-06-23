import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const [featured, hot] = await Promise.all([
    db.article.findMany({
      where: { isFeatured: true, status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      include: { category: { select: { name: true, slug: true } } },
    }),
    db.article.findMany({
      where: { isHot: true, status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      include: { category: { select: { name: true, slug: true } } },
    }),
  ]);

  return apiSuccess({ featured, hot });
}
