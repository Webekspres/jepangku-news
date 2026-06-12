import { db } from "@/lib/db";
import {
  homeArticleInclude,
  publishedArticleWhere,
  type HomeArticle,
} from "@/lib/home/article-include";
import { editorialViewMoreHref } from "@/lib/home/editorial-groups";
import { seedDatabase } from "@/lib/seed";
import type { HomeCategoriesEditorialResponse } from "@/lib/home/types";

type ScoredArticle = {
  article: HomeArticle;
  score: number;
};

type RankedCategory = {
  id: string;
  name: string;
  slug: string;
  score: number;
  articles: ScoredArticle[];
};

function articleEngagementScore(
  viewCount: number,
  reactionCount: number,
  commentCount: number,
): number {
  return viewCount + reactionCount + commentCount;
}

async function loadRankedCategories(): Promise<RankedCategory[]> {
  const articles = await db.article.findMany({
    where: {
      ...publishedArticleWhere,
      categoryId: { not: null },
    },
    include: homeArticleInclude,
  });

  if (articles.length === 0) return [];

  const articleIds = articles.map((article) => article.id);

  const [reactionGroups, commentGroups] = await Promise.all([
    db.reaction.groupBy({
      by: ["targetId"],
      where: { targetType: "ARTICLE", targetId: { in: articleIds } },
      _count: { _all: true },
    }),
    db.comment.groupBy({
      by: ["targetId"],
      where: {
        targetType: "ARTICLE",
        targetId: { in: articleIds },
        status: "VISIBLE",
        deletedAt: null,
      },
      _count: { _all: true },
    }),
  ]);

  const reactionMap = new Map(
    reactionGroups.map((row) => [row.targetId, row._count._all]),
  );
  const commentMap = new Map(
    commentGroups.map((row) => [row.targetId, row._count._all]),
  );

  const byCategory = new Map<string, RankedCategory>();

  for (const article of articles) {
    if (!article.categoryId || !article.category) continue;

    const score = articleEngagementScore(
      article.viewCount,
      reactionMap.get(article.id) ?? 0,
      commentMap.get(article.id) ?? 0,
    );

    const entry = byCategory.get(article.categoryId) ?? {
      id: article.categoryId,
      name: article.category.name,
      slug: article.category.slug,
      score: 0,
      articles: [],
    };

    entry.articles.push({ article, score });
    entry.score += score;
    byCategory.set(article.categoryId, entry);
  }

  return [...byCategory.values()]
    .map((category) => ({
      ...category,
      articles: [...category.articles].sort((a, b) => b.score - a.score),
    }))
    .sort((a, b) => b.score - a.score);
}

export async function fetchHomeCategoriesEditorial(): Promise<HomeCategoriesEditorialResponse> {
  await seedDatabase();

  const ranked = await loadRankedCategories();

  const featuredColumns = ranked.slice(0, 2).map((category) => {
    const sorted = category.articles.map((item) => item.article);
    return {
      slug: category.slug,
      title: category.name,
      viewMoreHref: editorialViewMoreHref(category.slug),
      featured: sorted[0] ?? null,
      list: sorted.slice(1, 4),
    };
  });

  const listColumns = ranked.slice(2, 5).map((category) => ({
    slug: category.slug,
    title: category.name,
    viewMoreHref: editorialViewMoreHref(category.slug),
    articles: category.articles.slice(0, 5).map((item) => item.article),
  }));

  return { featuredColumns, listColumns };
}
