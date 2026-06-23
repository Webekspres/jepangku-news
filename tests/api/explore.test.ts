import { beforeAll, describe, expect, it } from "bun:test";
import { parseApiResponse } from "@/lib/fetch-api";
import type { ExploreResponse } from "@/lib/explore/types";
import { EXPLORE_LIMITS } from "@/lib/explore/queries";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

function isWeeklyViewCountDesc(articles: { weeklyViewCount?: number }[]): boolean {
  for (let i = 1; i < articles.length; i++) {
    const prev = articles[i - 1]!.weeklyViewCount ?? 0;
    const curr = articles[i]!.weeklyViewCount ?? 0;
    if (prev < curr) return false;
  }
  return true;
}

describe("API — explore", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  describe("GET /api/explore", () => {
    it("returns aggregated explore payload in API envelope", async () => {
      if (skipUnless(ctx, "server")) return;

      const res = await clientFor(ctx).get("/api/explore");
      expect(res.status).toBe(200);

      const data = await parseApiResponse<ExploreResponse>(res);
      expect(Array.isArray(data.trendingArticles)).toBe(true);
      expect(Array.isArray(data.polls)).toBe(true);
      expect(Array.isArray(data.quizzes)).toBe(true);
      expect(Array.isArray(data.videos)).toBe(true);
      expect(Array.isArray(data.leaderboard)).toBe(true);
      expect(Array.isArray(data.categories)).toBe(true);
      expect(typeof data.leaderboardPeriodLabel).toBe("string");
      expect(data).toHaveProperty("featuredVideo");
    });

    it("respects content limits for each section", async () => {
      if (skipUnless(ctx, "server")) return;

      const data = await parseApiResponse<ExploreResponse>(
        await clientFor(ctx).get("/api/explore"),
      );

      expect(data.trendingArticles.length).toBeLessThanOrEqual(
        EXPLORE_LIMITS.trendingArticles,
      );
      expect(data.polls.length).toBeLessThanOrEqual(EXPLORE_LIMITS.polls);
      expect(data.quizzes.length).toBeLessThanOrEqual(EXPLORE_LIMITS.quizzes);
      expect(data.videos.length).toBeLessThanOrEqual(EXPLORE_LIMITS.videoSidebar);
      expect(data.leaderboard.length).toBeLessThanOrEqual(EXPLORE_LIMITS.leaderboard);
    });

    it("orders trending articles by weeklyViewCount descending", async () => {
      if (skipUnless(ctx, "server")) return;

      const data = await parseApiResponse<ExploreResponse>(
        await clientFor(ctx).get("/api/explore"),
      );

      if (data.trendingArticles.length < 2) return;
      expect(isWeeklyViewCountDesc(data.trendingArticles)).toBe(true);
    });

    it("includes poll and quiz preview fields for cards", async () => {
      if (skipUnless(ctx, "server")) return;

      const data = await parseApiResponse<ExploreResponse>(
        await clientFor(ctx).get("/api/explore"),
      );

      for (const poll of data.polls) {
        expect(poll.id).toBeTruthy();
        expect(poll.slug).toBeTruthy();
        expect(poll.title).toBeTruthy();
        expect(typeof poll.questionCount).toBe("number");
        expect(typeof poll.totalVotes).toBe("number");
        expect(poll).toHaveProperty("description");
        expect(poll).toHaveProperty("thumbnailUrl");
      }

      for (const quiz of data.quizzes) {
        expect(quiz.id).toBeTruthy();
        expect(quiz.slug).toBeTruthy();
        expect(quiz.title).toBeTruthy();
        expect(typeof quiz.questionCount).toBe("number");
        expect(quiz).toHaveProperty("description");
        expect(quiz).toHaveProperty("thumbnailUrl");
      }
    });

    it("excludes featured video from sidebar list", async () => {
      if (skipUnless(ctx, "server")) return;

      const data = await parseApiResponse<ExploreResponse>(
        await clientFor(ctx).get("/api/explore"),
      );

      if (!data.featuredVideo) return;

      const sidebarIds = data.videos.map((video) => video.id);
      expect(sidebarIds).not.toContain(data.featuredVideo.id);
    });

    it("returns categories sorted by name for sidebar navigation", async () => {
      if (skipUnless(ctx, "server")) return;

      const data = await parseApiResponse<ExploreResponse>(
        await clientFor(ctx).get("/api/explore"),
      );

      expect(data.categories.length).toBeGreaterThan(0);

      for (const category of data.categories) {
        expect(category.id).toBeTruthy();
        expect(category.slug).toBeTruthy();
        expect(category.name).toBeTruthy();
      }

      const names = data.categories.map((category) => category.name);
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sorted);
    });

    it("returns cache headers", async () => {
      if (skipUnless(ctx, "server")) return;

      const res = await clientFor(ctx).get("/api/explore");
      const cache = res.headers.get("cache-control") ?? "";
      expect(cache).toMatch(/s-maxage/);
      expect(cache).toMatch(/stale-while-revalidate/);
    });
  });
});
