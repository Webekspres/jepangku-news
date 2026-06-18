import { db } from '@/lib/db';
import { getArticleViewHref } from '@/lib/article-view-url';
import { createNotification } from '@/lib/notifications/create';

export type CategorySubscriptionDto = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  subscribedAt: string;
};

export async function listUserCategorySubscriptions(
  userId: string,
): Promise<CategorySubscriptionDto[]> {
  const rows = await db.categorySubscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    categoryId: row.category.id,
    categoryName: row.category.name,
    categorySlug: row.category.slug,
    subscribedAt: row.createdAt.toISOString(),
  }));
}

export async function isUserSubscribedToCategory(
  userId: string,
  categoryId: string,
): Promise<boolean> {
  const row = await db.categorySubscription.findUnique({
    where: { userId_categoryId: { userId, categoryId } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function subscribeToCategory(
  userId: string,
  categoryId: string,
): Promise<{ ok: boolean; error?: string }> {
  const category = await db.category.findFirst({
    where: { id: categoryId, isActive: true },
    select: { id: true },
  });
  if (!category) {
    return { ok: false, error: 'Kategori tidak ditemukan' };
  }

  await db.categorySubscription.upsert({
    where: { userId_categoryId: { userId, categoryId } },
    create: { userId, categoryId },
    update: {},
  });

  return { ok: true };
}

export async function unsubscribeFromCategory(
  userId: string,
  categoryId: string,
): Promise<boolean> {
  const result = await db.categorySubscription.deleteMany({
    where: { userId, categoryId },
  });
  return result.count > 0;
}

export async function resolveCategoryId(
  categoryId?: string | null,
  categorySlug?: string | null,
): Promise<string | null> {
  if (categoryId?.trim()) {
    const byId = await db.category.findFirst({
      where: { id: categoryId.trim(), isActive: true },
      select: { id: true },
    });
    return byId?.id ?? null;
  }

  const slug = categorySlug?.trim();
  if (!slug) return null;

  const bySlug = await db.category.findFirst({
    where: { slug, isActive: true },
    select: { id: true },
  });
  return bySlug?.id ?? null;
}

/** Notify category subscribers when an article is published (excludes author). */
export async function notifyCategorySubscribersOfArticle(
  articleId: string,
): Promise<void> {
  const article = await db.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      categoryId: true,
      authorId: true,
      category: { select: { name: true } },
    },
  });

  if (!article || article.status !== 'PUBLISHED' || !article.categoryId) return;

  const subscribers = await db.categorySubscription.findMany({
    where: {
      categoryId: article.categoryId,
      userId: { not: article.authorId },
    },
    select: { userId: true },
  });

  if (subscribers.length === 0) return;

  const link = getArticleViewHref({
    id: article.id,
    slug: article.slug,
    status: article.status,
  });

  const categoryName = article.category?.name ?? 'kategori';

  await Promise.all(
    subscribers.map((sub) =>
      createNotification({
        userId: sub.userId,
        type: 'NEW_ARTICLE_IN_CATEGORY',
        title: `Artikel baru: ${categoryName}`,
        body: `“${article.title}” baru dipublikasikan.`,
        link,
        dedupeKey: `category_article:${article.id}:${sub.userId}`,
        metadata: {
          articleId: article.id,
          categoryId: article.categoryId,
        },
        priority: 'NORMAL',
      }),
    ),
  );
}
