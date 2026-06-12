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

export type PublicAdBanner = {
  id: string;
  position: string;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  altText: string | null;
};

export type HomeAdResponse = {
  slot: string;
  banner: PublicAdBanner | null;
};

export type LmsTeaserHighlight = {
  title: string;
  description: string;
};

export type LmsTeaserCourse = {
  slug: string;
  title: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  description: string;
  thumbnailUrl: string;
  badge: string;
  price: string;
  duration: string;
  lessons: number;
  availability: "tersedia" | "segera";
  availabilityLabel: string;
  href: string;
};

export type HomeLmsTeaserResponse = {
  catalogUrl: string;
  highlights: LmsTeaserHighlight[];
  courses: LmsTeaserCourse[];
};

export type HomeReactionEmojiStat = {
  type: string;
  emoji: string;
  label: string;
  count: number;
};

export type HomeReactedArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: { name: string; slug: string } | null;
  author: { name: string; username: string } | null;
  reactionTotal: number;
  dominantReaction: string;
  dominantEmoji: string;
  dominantLabel: string;
  reactionCounts: Record<string, number>;
};

export type HomeReactionsResponse = {
  period: "week" | "all-time";
  globalTotal: number;
  emojiStats: HomeReactionEmojiStat[];
  articles: HomeReactedArticle[];
};
