import { beforeAll, describe, expect, it } from "bun:test";
import { HOME_WAVE_ENDPOINTS } from "../helpers/fixtures";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

describe("API — home waves", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  for (const { wave, path, expectCache } of HOME_WAVE_ENDPOINTS) {
    describe(`wave ${wave} — ${path}`, () => {
      it("returns 200 with JSON body", async () => {
        if (skipUnless(ctx, "server")) return;
        const res = await clientFor(ctx).get(path);
        expect(res.status).toBe(200);
        expect(res.headers.get("content-type")).toContain("application/json");
      });

      if (expectCache) {
        it("sets Cache-Control s-maxage header", async () => {
          if (skipUnless(ctx, "server")) return;
          const res = await clientFor(ctx).get(path);
          const cache = res.headers.get("cache-control") ?? "";
          expect(cache).toContain("s-maxage");
        });
      }
    });
  }

  describe("wave 1 — feed payload", () => {
    it("includes featuredArticles array", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/feed");
      const data = (await res.json()) as { featuredArticles?: unknown[] };
      expect(Array.isArray(data.featuredArticles)).toBe(true);
    });
  });

  describe("wave 4 — engagement payload", () => {
    it("includes polls, quizzes, and leaderboard preview", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/engagement");
      const data = (await res.json()) as {
        polls?: unknown[];
        quizzes?: unknown[];
        leaderboard?: { rank: number; displayName: string }[];
      };
      expect(Array.isArray(data.polls)).toBe(true);
      expect(Array.isArray(data.quizzes)).toBe(true);
      expect(Array.isArray(data.leaderboard)).toBe(true);
      if (data.leaderboard && data.leaderboard.length > 0) {
        expect(typeof data.leaderboard[0]!.rank).toBe("number");
        expect(typeof data.leaderboard[0]!.displayName).toBe("string");
      }
    });
  });

  describe("wave 3 — reactions payload", () => {
    it("includes articles array", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/reactions");
      const data = (await res.json()) as { articles?: unknown[] };
      expect(Array.isArray(data.articles)).toBe(true);
    });

    it("returns lazy homepage reactions section shape", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/reactions");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        articles: { id: string; slug: string }[];
      };
      expect(Array.isArray(data.articles)).toBe(true);
      if (data.articles[0]) {
        expect(typeof data.articles[0].slug).toBe("string");
      }
    });
  });

  describe("wave 3 — TV payload", () => {
    it("includes featuredVideo and sidebarVideos for lazy homepage section", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/tv");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        featuredVideo: unknown;
        sidebarVideos: unknown[];
      };
      expect(data).toHaveProperty("featuredVideo");
      expect(Array.isArray(data.sidebarVideos)).toBe(true);
    });
  });

  describe("wave 3 — LMS teaser payload", () => {
    it("returns placeholder fallback when LMS is unreachable", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/lms-teaser");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        source: "live" | "placeholder";
        catalogUrl: string;
        highlights: { title: string }[];
        courses: unknown[];
      };
      expect(["live", "placeholder"]).toContain(data.source);
      expect(Array.isArray(data.highlights)).toBe(true);
      expect(data.highlights.length).toBeGreaterThan(0);
      expect(Array.isArray(data.courses)).toBe(true);
      expect(data.catalogUrl).toContain("utm_source=jepangku.com");
      if (data.source === "placeholder") {
        expect(data.courses).toHaveLength(0);
      } else {
        expect(data.courses.length).toBeGreaterThan(0);
      }
    });
  });

  describe("legacy endpoint removed", () => {
    it("GET /api/homepage returns 404", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/homepage");
      expect(res.status).toBe(404);
    });
  });

  describe("public categories navbar", () => {
    it("GET /api/categories/navbar returns categories", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/categories/navbar");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { categories?: unknown[] };
      expect(Array.isArray(data.categories)).toBe(true);
    });
  });

  describe("social links public", () => {
    it("GET /api/social-links returns array with valid hrefs", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/social-links");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        links?: { id: string; label: string; href: string }[];
      };
      const links = data.links ?? [];
      expect(Array.isArray(links)).toBe(true);
      for (const link of links) {
        expect(link.href).toMatch(/^https?:\/\//);
      }
    });
  });
});
