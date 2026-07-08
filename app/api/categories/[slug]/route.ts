import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { db } from '@/lib/db';
import { withRequestLogging } from '@/lib/logging/request-logger';

const GET = withRequestLogging(async (
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params;

  const category = await db.category.findUnique({ where: { slug } });
  if (!category) {
    return apiError('Category not found' , { status: 404 });
  }
  return apiSuccess(category);
});

export { GET };
