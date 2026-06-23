import type { HomeArticle } from "@/lib/home/article-include";
import type {
  HomeLeaderboardEntry,
  PublicVideoSummary,
} from "@/lib/home/types";

export type ExplorePollPreview = {
  id: string;
  title: string;
  slug: string;
  pollType: string;
  questionCount: number;
  totalVotes: number;
  thumbnailUrl: string | null;
  description: string | null;
};

export type ExploreQuizPreview = {
  id: string;
  title: string;
  slug: string;
  questionCount: number;
  thumbnailUrl: string | null;
  description: string | null;
};

export type ExploreCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ExploreResponse = {
  trendingArticles: HomeArticle[];
  polls: ExplorePollPreview[];
  quizzes: ExploreQuizPreview[];
  featuredVideo: PublicVideoSummary | null;
  videos: PublicVideoSummary[];
  leaderboard: HomeLeaderboardEntry[];
  leaderboardPeriodLabel: string;
  categories: ExploreCategory[];
};
