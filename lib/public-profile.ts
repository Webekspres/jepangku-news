import { db } from './db';

const PUBLIC_ARTICLE_WHERE = {
  status: 'PUBLISHED' as const,
  visibility: 'public',
};

export type PublicAuthorStats = {
  publishedArticles: number;
};

export type PublicAuthorProfile = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  memberSince: string;
  isContributor: boolean;
  stats: PublicAuthorStats;
};

/**
 * Ambil user aktif berdasarkan username untuk profil publik.
 * Email, poin, status, dan data sensitif tidak disertakan.
 */
export async function findPublicAuthorByUsername(username: string) {
  return db.user.findFirst({
    where: { username, status: 'active' },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
      role: true,
      profile: { select: { displayName: true, bio: true } },
    },
  });
}

export async function getPublicAuthorStats(userId: string): Promise<PublicAuthorStats> {
  const publishedArticles = await db.article.count({
    where: { authorId: userId, ...PUBLIC_ARTICLE_WHERE },
  });

  return { publishedArticles };
}

export function isPublicContributor(role: string): boolean {
  return role === 'ADMIN' || role === 'CONTRIBUTOR';
}

export function serializePublicAuthor(
  user: NonNullable<Awaited<ReturnType<typeof findPublicAuthorByUsername>>>,
  stats: PublicAuthorStats,
): PublicAuthorProfile {
  return {
    username: user.username,
    displayName: user.profile?.displayName ?? user.name,
    avatarUrl: user.avatarUrl,
    bio: user.profile?.bio ?? null,
    memberSince: user.createdAt.toISOString(),
    isContributor: isPublicContributor(user.role),
    stats,
  };
}

export async function getPublicAuthorArticles(
  userId: string,
  page: number,
  limit: number,
) {
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where: { authorId: userId, ...PUBLIC_ARTICLE_WHERE },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
      },
    }),
    db.article.count({ where: { authorId: userId, ...PUBLIC_ARTICLE_WHERE } }),
  ]);

  return {
    articles: articles.map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      coverImageUrl: a.coverImageUrl,
      viewCount: a.viewCount,
      publishedAt: a.publishedAt?.toISOString() ?? null,
      category: a.category,
    })),
    total,
    page,
    limit,
    hasMore: skip + articles.length < total,
  };
}

export async function getProfileRecommendedArticles(
  excludeAuthorId: string,
  limit = 3,
) {
  const articles = await db.article.findMany({
    where: {
      ...PUBLIC_ARTICLE_WHERE,
      authorId: { not: excludeAuthorId },
    },
    orderBy: [{ weeklyViewCount: 'desc' }, { publishedAt: 'desc' }],
    take: limit,
    include: {
      author: { select: { name: true, username: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  return articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImageUrl: article.coverImageUrl,
    viewCount: article.viewCount,
    author: article.author,
    category: article.category,
  }));
}
