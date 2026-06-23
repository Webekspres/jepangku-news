import { describe, expect, it } from "bun:test";
import { EXPLORE_LIMITS } from "@/lib/explore/queries";

describe("explore limits", () => {
  it("exposes stable section caps for explore page", () => {
    expect(EXPLORE_LIMITS).toEqual({
      trendingArticles: 6,
      polls: 3,
      quizzes: 3,
      videoSidebar: 6,
      leaderboard: 5,
    });
  });
});
