import { NextResponse } from "next/server";
import { fetchCategoriesWithArticles } from "@/lib/home/queries/categories";
import { fetchHomeEngagement } from "@/lib/home/queries/engagement";
import { fetchHomeFeed, fetchLatestNonFeaturedArticles } from "@/lib/home/queries/feed";
import type { HomeEngagementResponse, HomeFeedResponse } from "@/lib/home/types";
import type { CategoryWithArticles } from "@/lib/home/queries/categories";

/** @deprecated Use `/api/home/feed` and `/api/home/engagement` instead. */
export type HomepageResponse = HomeFeedResponse &
  HomeEngagementResponse & {
    /** Legacy field — latest non-featured articles */
    articles: HomeFeedResponse["todayArticles"];
    categories: CategoryWithArticles[];
  };

export async function GET(): Promise<NextResponse<HomepageResponse>> {
  const [feed, engagement, categories, articles] = await Promise.all([
    fetchHomeFeed(),
    fetchHomeEngagement(),
    fetchCategoriesWithArticles(),
    fetchLatestNonFeaturedArticles(7),
  ]);

  const response: HomepageResponse = {
    ...feed,
    ...engagement,
    articles,
    categories,
  };

  return NextResponse.json(response, {
    headers: {
      Deprecation: 'true',
      Link: '</api/home/feed>; rel="successor-version"',
    },
  });
}
