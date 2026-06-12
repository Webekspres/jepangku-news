import { db } from "@/lib/db";
import {
  homeArticleInclude,
  publishedArticleWhere,
  type HomeArticle,
} from "@/lib/home/article-include";
import {
  EDITORIAL_FEATURED_GROUPS,
  EDITORIAL_LIST_GROUPS,
  editorialViewMoreHref,
  type EditorialGroupConfig,
} from "@/lib/home/editorial-groups";
import { seedDatabase } from "@/lib/seed";
import type { HomeCategoriesEditorialResponse } from "@/lib/home/types";

async function fetchArticlesForGroup(
  group: EditorialGroupConfig,
  take: number,
): Promise<HomeArticle[]> {
  const categories = await db.category.findMany({
    where: { slug: { in: group.categorySlugs }, isActive: true },
    select: { id: true },
  });

  if (categories.length === 0) return [];

  return db.article.findMany({
    where: {
      ...publishedArticleWhere,
      categoryId: { in: categories.map((c) => c.id) },
    },
    orderBy: { publishedAt: "desc" },
    take,
    include: homeArticleInclude,
  });
}

async function buildFeaturedColumn(group: EditorialGroupConfig) {
  const articles = await fetchArticlesForGroup(group, 4);

  return {
    slug: group.slug,
    title: group.title,
    viewMoreHref: editorialViewMoreHref(group.primaryCategorySlug),
    featured: articles[0] ?? null,
    list: articles.slice(1, 4),
  };
}

async function buildListColumn(group: EditorialGroupConfig) {
  const articles = await fetchArticlesForGroup(group, 5);

  return {
    slug: group.slug,
    title: group.title,
    viewMoreHref: editorialViewMoreHref(group.primaryCategorySlug),
    articles,
  };
}

export async function fetchHomeCategoriesEditorial(): Promise<HomeCategoriesEditorialResponse> {
  await seedDatabase();

  const [featuredColumns, listColumns] = await Promise.all([
    Promise.all(EDITORIAL_FEATURED_GROUPS.map(buildFeaturedColumn)),
    Promise.all(EDITORIAL_LIST_GROUPS.map(buildListColumn)),
  ]);

  return { featuredColumns, listColumns };
}
