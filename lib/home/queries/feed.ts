import { db } from "@/lib/db";
import {
  homeArticleInclude,
  publishedArticleWhere,
} from "@/lib/home/article-include";
import type { HomeFeedResponse } from "@/lib/home/types";

const LATEST_TAKE = 12;

export async function fetchHomeFeed(): Promise<HomeFeedResponse> {
  const [
    featuredArticles,
    popularArticles,
    trending,
    latestArticles,
    latestNonFeatured,
  ] =
    await Promise.all([
      db.article.findMany({
        where: { ...publishedArticleWhere, isFeatured: true },
        orderBy: { publishedAt: "desc" },
        include: homeArticleInclude,
      }),
      db.article.findMany({
        where: { ...publishedArticleWhere, isHot: true },
        orderBy: { publishedAt: "desc" },
        take: 5,
        include: homeArticleInclude,
      }),
      db.article.findMany({
        where: publishedArticleWhere,
        orderBy: { weeklyViewCount: "desc" },
        take: 5,
        include: homeArticleInclude,
      }),
      db.article.findMany({
        where: publishedArticleWhere,
        orderBy: { publishedAt: "desc" },
        take: LATEST_TAKE,
        include: homeArticleInclude,
      }),
      db.article.findMany({
        where: {
          ...publishedArticleWhere,
          NOT: { isFeatured: true },
        },
        orderBy: { publishedAt: "desc" },
        take: 1,
        include: homeArticleInclude,
      }),
    ]);

  return {
    featuredArticles,
    popularArticles,
    trending,
    todayArticles: latestArticles,
    todaySource: "fallback",
    featuredFallback: latestNonFeatured[0] ?? null,
  };
}

export async function fetchLatestNonFeaturedArticles(
  take = 7,
): Promise<HomeFeedResponse["todayArticles"]> {
  return db.article.findMany({
    where: {
      ...publishedArticleWhere,
      NOT: { isFeatured: true },
    },
    orderBy: { publishedAt: "desc" },
    take,
    include: homeArticleInclude,
  });
}
