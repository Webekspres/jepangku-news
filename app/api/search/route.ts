import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { captureException } from '@/lib/monitoring';
import { logger } from '@/lib/logger';
import { clampSearchLimit, normalizeSearchQuery, searchAll } from '@/lib/search';
import { withRequestLogging } from '@/lib/logging/request-logger';

// GET /api/search?q=...&limit=12
const GET = withRequestLogging(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const query = normalizeSearchQuery(searchParams.get('q'));

  if (!query) {
    return apiError('Parameter q wajib diisi' , { status: 400 });
  }

  const limit = clampSearchLimit(searchParams.get('limit'));

  const start = Date.now();

  try {
    const results = await searchAll(query, limit);
    const totalResults = results.total ?? results.articles?.length ?? 0;

    logger.info('search.completed', {
      query: query.substring(0, 60),
      queryLength: query.length,
      limit,
      totalResults,
      durationMs: Date.now() - start,
    });

    return apiSuccess({ query, ...results });
  } catch (e) {
    logger.warn('search.failed', { query: query.substring(0, 60), durationMs: Date.now() - start });
    await captureException(e, { route: 'search-get' });
    return apiError('Gagal mencari' , { status: 500 });
  }
});

export { GET };
