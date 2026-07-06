import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const pages = await db.infoPage.findMany({
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      isPublished: true,
      sortOrder: true,
      updatedAt: true,
      updatedBy: { select: { name: true } },
    },
  });

  return apiSuccess(
    pages.map((page) => ({
      ...page,
      updatedAt: page.updatedAt.toISOString(),
      updatedByName: page.updatedBy?.name ?? null,
    })),
  );
}
