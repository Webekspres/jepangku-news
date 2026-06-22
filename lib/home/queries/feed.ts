import { db } from "@/lib/db";
import {
  homeArticleInclude,
  publishedArticleWhere,
} from "@/lib/home/article-include";
import { getJakartaDayBounds } from "@/lib/home/jakarta-day";
import type { HomeFeedResponse } from "@/lib/home/types";

const TODAY_MIN_COUNT = 3;
const TODAY_TAKE = 6;

export async function fetchHomeFeed(): Promise<HomeFeedResponse> {
  const { start, end } = getJakartaDayBounds();

  const [featuredArticles, trending, todayRaw, latestArticles] =
    await Promise.all([
      db.article.findMany({
        where: { ...publishedArticleWhere, isFeatured: true },
        orderBy: { publishedAt: "desc" },
        include: homeArticleInclude,
      }),
      db.article.findMany({
        where: publishedArticleWhere,
        orderBy: { weeklyViewCount: "desc" },
        take: 5,
        include: homeArticleInclude,
      }),
      db.article.findMany({
        where: {
          ...publishedArticleWhere,
          publishedAt: { gte: start, lte: end },
        },
        orderBy: { publishedAt: "desc" },
        take: TODAY_TAKE,
        include: homeArticleInclude,
      }),
      db.article.findMany({
        where: {
          ...publishedArticleWhere,
          NOT: { isFeatured: true },
        },
        orderBy: { publishedAt: "desc" },
        take: 7,
        include: homeArticleInclude,
      }),
    ]);

  let todayArticles = todayRaw;
  let todaySource: HomeFeedResponse["todaySource"] = "today";

  if (todayArticles.length < TODAY_MIN_COUNT) {
    todayArticles = latestArticles.slice(0, TODAY_TAKE);
    todaySource = "fallback";
  }

  return {
    featuredArticles,
    trending,
    todayArticles,
    todaySource,
    featuredFallback: latestArticles[0] ?? null,
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
