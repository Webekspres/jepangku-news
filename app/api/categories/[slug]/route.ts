import { apiError, apiSuccess } from '@/lib/api-response';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const category = await db.category.findUnique({ where: { slug } });
  if (!category) {
    return apiError('Category not found' , { status: 404 });
  }
  return apiSuccess(category);
}
