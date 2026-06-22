import { beforeAll, describe, expect, it } from "bun:test";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

describe("API — §12 Homepage & discovery", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  describe("12.2 — wave 1 feed payload", () => {
    it("includes featured, trending, and today articles", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/feed");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        featuredArticles?: unknown[];
        trending?: unknown[];
        todayArticles?: unknown[];
        todaySource?: string;
      };
      expect(Array.isArray(data.featuredArticles)).toBe(true);
      expect(Array.isArray(data.trending)).toBe(true);
      expect(Array.isArray(data.todayArticles)).toBe(true);
      expect(["today", "fallback"]).toContain(data.todaySource);
    });

    it("trending in feed is ordered by weeklyViewCount desc", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/feed");
      const data = (await res.json()) as {
        trending: { weeklyViewCount?: number }[];
      };
      const counts = data.trending.map((a) => a.weeklyViewCount ?? 0);
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i]!).toBeLessThanOrEqual(counts[i - 1]!);
      }
    });
  });

  describe("12.4 — wave 3 isolated endpoints", () => {
    const wave3Paths = [
      "/api/home/tv",
      "/api/home/ads?slot=homepage-mid",
      "/api/home/lms-teaser",
      "/api/home/reactions",
    ] as const;

    for (const path of wave3Paths) {
      it(`${path} returns 200 independently`, async () => {
        if (skipUnless(ctx, "server")) return;
        const res = await clientFor(ctx).get(path);
        expect(res.status).toBe(200);
        expect(res.headers.get("content-type")).toContain("application/json");
      });
    }
  });

  describe("12.8 — global search multi-type", () => {
    it("GET /api/search returns articles, quizzes, and polls arrays", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/search?q=a&limit=5");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        query?: string;
        articles?: unknown[];
        quizzes?: unknown[];
        polls?: unknown[];
        total?: number;
      };
      expect(data.query).toBe("a");
      expect(Array.isArray(data.articles)).toBe(true);
      expect(Array.isArray(data.quizzes)).toBe(true);
      expect(Array.isArray(data.polls)).toBe(true);
      expect(typeof data.total).toBe("number");
    });

    it("GET /api/search rejects empty query", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/search?q=");
      expect(res.status).toBe(400);
    });
  });

  describe("12.9 — trending sort weeklyViewCount", () => {
    it("GET /api/articles?sort=trending orders by weeklyViewCount desc", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/articles?sort=trending&limit=10");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        articles: { weeklyViewCount?: number }[];
      };
      expect(Array.isArray(data.articles)).toBe(true);
      const counts = data.articles.map((a) => a.weeklyViewCount ?? 0);
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i]!).toBeLessThanOrEqual(counts[i - 1]!);
      }
    });
  });

  describe("12.11 — tag populer API", () => {
    it("GET /api/tags/popular returns sorted tags with articleCount", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/tags/popular?limit=10");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        id: string;
        name: string;
        slug: string;
        articleCount: number;
      }[];
      expect(Array.isArray(data)).toBe(true);
      for (const tag of data) {
        expect(typeof tag.id).toBe("string");
        expect(typeof tag.name).toBe("string");
        expect(typeof tag.slug).toBe("string");
        expect(typeof tag.articleCount).toBe("number");
        expect(tag.articleCount).toBeGreaterThan(0);
      }
      for (let i = 1; i < data.length; i++) {
        expect(data[i]!.articleCount).toBeLessThanOrEqual(data[i - 1]!.articleCount);
      }
    });
  });

  describe("12.12 — admin homepage config", () => {
    it("GET /api/admin/homepage returns 403 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/admin/homepage");
      expect(res.status).toBe(403);
    });

    it("GET /api/admin/homepage returns featured and hot for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/homepage");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        featured?: unknown[];
        hot?: unknown[];
      };
      expect(Array.isArray(data.featured)).toBe(true);
      expect(Array.isArray(data.hot)).toBe(true);
    });

    it("GET /api/admin/homepage/stats returns counts for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/homepage/stats");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { featured?: number; hot?: number };
      expect(typeof data.featured).toBe("number");
      expect(typeof data.hot).toBe("number");
    });
  });
});
