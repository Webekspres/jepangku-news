import { apiError, apiSuccess } from '@/lib/api-response';
import { captureException } from '@/lib/monitoring';
import { clampSearchLimit, normalizeSearchQuery, searchAll } from '@/lib/search';

// GET /api/search?q=...&limit=12
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = normalizeSearchQuery(searchParams.get('q'));

  if (!query) {
    return apiError('Parameter q wajib diisi' , { status: 400 });
  }

  const limit = clampSearchLimit(searchParams.get('limit'));

  try {
    const results = await searchAll(query, limit);
    return apiSuccess({ query, ...results });
  } catch (e) {
    await captureException(e, { route: 'search-get' });
    return apiError('Gagal mencari' , { status: 500 });
  }
}
