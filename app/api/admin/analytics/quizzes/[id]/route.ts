import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { getQuizAnalytics } from '@/lib/analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;
  const data = await getQuizAnalytics(id);
  if (!data) {
    return apiError('Kuis tidak ditemukan' , { status: 404 });
  }

  return apiSuccess(data);
}
