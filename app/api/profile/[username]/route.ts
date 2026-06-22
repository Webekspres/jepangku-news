import { NextRequest, NextResponse } from 'next/server';
import { captureException } from '@/lib/monitoring';
import {
  findPublicAuthorByUsername,
  getProfileRecommendedArticles,
  getPublicAuthorArticles,
  getPublicAuthorStats,
  isPublicContributor,
  serializePublicAuthor,
} from '@/lib/public-profile';

// GET /api/profile/[username]?page=1&limit=12
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12', 10) || 12, 1), 30);

  if (!username || !/^[a-z0-9_]+$/.test(username)) {
    return NextResponse.json({ error: 'Username tidak valid' }, { status: 400 });
  }

  try {
    const user = await findPublicAuthorByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 });
    }

    const contributor = isPublicContributor(user.role);

    const [stats, articlePage, relatedArticles] = await Promise.all([
      getPublicAuthorStats(user.id),
      contributor
        ? getPublicAuthorArticles(user.id, page, limit)
        : Promise.resolve({
            articles: [],
            total: 0,
            page,
            limit,
            hasMore: false,
          }),
      getProfileRecommendedArticles(user.id),
    ]);

    return NextResponse.json({
      profile: serializePublicAuthor(user, stats),
      articles: articlePage.articles,
      relatedArticles,
      total: articlePage.total,
      page: articlePage.page,
      limit: articlePage.limit,
      hasMore: articlePage.hasMore,
    });
  } catch (e) {
    await captureException(e, { route: 'profile-get', username });
    return NextResponse.json({ error: 'Gagal memuat profil' }, { status: 500 });
  }
}
