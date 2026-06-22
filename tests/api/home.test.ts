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
    it("includes polls and quizzes arrays", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/engagement");
      const data = (await res.json()) as { polls?: unknown[]; quizzes?: unknown[] };
      expect(Array.isArray(data.polls)).toBe(true);
      expect(Array.isArray(data.quizzes)).toBe(true);
    });
  });

  describe("wave 3 — reactions payload", () => {
    it("includes articles array", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/reactions");
      const data = (await res.json()) as { articles?: unknown[] };
      expect(Array.isArray(data.articles)).toBe(true);
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
    it("GET /api/social-links returns array", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/social-links");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { links?: unknown[] };
      expect(Array.isArray(data.links ?? data)).toBe(true);
    });
  });
});
