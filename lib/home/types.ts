import type { HomeArticle } from "@/lib/home/article-include";

export type HomeFeedResponse = {
  featuredArticles: HomeArticle[];
  trending: HomeArticle[];
  todayArticles: HomeArticle[];
  /** `fallback` when fewer than 3 articles published today (Asia/Jakarta) */
  todaySource: "today" | "fallback";
  /** Used when no featured articles exist */
  featuredFallback: HomeArticle | null;
};

export type HomePollSummary = {
  id: string;
  title: string;
  slug: string;
  pollType: string;
  questionCount: number;
  totalVotes: number;
};

export type HomeQuizSummary = {
  id: string;
  title: string;
  slug: string;
  questionCount: number;
};

export type HomeLeaderboardEntry = {
  rank: number;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  totalXp: number;
  currentPoints: number;
  period: "all-time";
};

export type HomeEngagementResponse = {
  polls: HomePollSummary[];
  quizzes: HomeQuizSummary[];
  leaderboard: HomeLeaderboardEntry[];
};

export type EditorialFeaturedColumn = {
  slug: string;
  title: string;
  viewMoreHref: string;
  featured: HomeArticle | null;
  list: HomeArticle[];
};

export type EditorialListColumn = {
  slug: string;
  title: string;
  viewMoreHref: string;
  articles: HomeArticle[];
};

export type HomeCategoriesEditorialResponse = {
  featuredColumns: EditorialFeaturedColumn[];
  listColumns: EditorialListColumn[];
};

export type PublicVideoSummary = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  youtubeId: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  viewCount: number;
  isFeatured: boolean;
};

export type HomeTvResponse = {
  featuredVideo: PublicVideoSummary | null;
  sidebarVideos: PublicVideoSummary[];
};
