import { beforeAll, describe, expect, it } from "bun:test";
import { parseApiResponse } from "@/lib/fetch-api";
import {
  fetchCategorySlug,
  fetchPopularTagSlug,
} from "../helpers/fixtures";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

type ArticleListResponse = {
  articles: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    category?: { slug: string; name: string } | null;
  }[];
  total: number;
  limit: number;
  page: number;
  hasMore: boolean;
};

describe("API — article list filters", () => {
  let ctx: IntegrationContext;
  let categorySlug: string | null = null;
  let tagSlug: string | null = null;

  beforeAll(async () => {
    ctx = await setupIntegration();
    if (!ctx.serverUp) return;
    const guest = clientFor(ctx);
    categorySlug = await fetchCategorySlug(guest);
    tagSlug = await fetchPopularTagSlug(guest);
  });

  describe("filter metadata", () => {
    it("GET /api/categories returns categories for sidebar", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/categories");
      expect(res.status).toBe(200);
      const data = await parseApiResponse(res);
      expect(Array.isArray(data)).toBe(true);
      expect((data as { slug: string; name: string }[]).length).toBeGreaterThan(0);
    });

    it("GET /api/tags/popular returns tags for sidebar", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/tags/popular?limit=10");
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as {
        slug: string;
        name: string;
        articleCount: number;
      }[];
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].slug).toBeTruthy();
        expect(typeof data[0].articleCount).toBe("number");
      }
    });
  });

  describe("sort", () => {
    for (const sort of ["latest", "popular", "trending"] as const) {
      it(`GET /api/articles supports sort=${sort}`, async () => {
        if (skipUnless(ctx, "server")) return;
        const res = await clientFor(ctx).get(`/api/articles?sort=${sort}&limit=5`);
        expect(res.status).toBe(200);
        const data = (await parseApiResponse(res)) as ArticleListResponse;
        expect(Array.isArray(data.articles)).toBe(true);
        expect(typeof data.total).toBe("number");
      });
    }

    it("sort=popular orders by viewCount descending", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/articles?sort=popular&limit=5");
      const data = (await parseApiResponse(res)) as {
        articles: { viewCount?: number }[];
      };
      if (data.articles.length >= 2) {
        const a = data.articles[0].viewCount ?? 0;
        const b = data.articles[1].viewCount ?? 0;
        expect(a).toBeGreaterThanOrEqual(b);
      }
    });
  });

  describe("category filter", () => {
    it("GET /api/articles filters by category slug", async () => {
      if (skipUnless(ctx, "server") || !categorySlug) return;
      const res = await clientFor(ctx).get(
        `/api/articles?category=${categorySlug}&limit=10`,
      );
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as ArticleListResponse;
      expect(Array.isArray(data.articles)).toBe(true);
      for (const article of data.articles) {
        expect(article.category?.slug).toBe(categorySlug);
      }
    });

    it("unknown category slug is ignored (returns unfiltered list)", async () => {
      if (skipUnless(ctx, "server")) return;
      const api = clientFor(ctx);
      const all = (await parseApiResponse(
        await api.get("/api/articles?limit=5"),
      )) as ArticleListResponse;
      const unknown = (await parseApiResponse(
        await api.get("/api/articles?category=nonexistent-category-xyz&limit=5"),
      )) as ArticleListResponse;
      expect(unknown.articles.length).toBeGreaterThan(0);
      expect(unknown.total).toBe(all.total);
    });
  });

  describe("tag filter", () => {
    it("GET /api/articles filters by tag slug", async () => {
      if (skipUnless(ctx, "server") || !tagSlug) return;
      const res = await clientFor(ctx).get(`/api/articles?tag=${tagSlug}&limit=10`);
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as ArticleListResponse;
      expect(Array.isArray(data.articles)).toBe(true);
    });
  });

  describe("search filter", () => {
    it("GET /api/articles filters by search keyword", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/articles?search=Jepang&limit=5");
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as ArticleListResponse;
      expect(Array.isArray(data.articles)).toBe(true);
    });
  });

  describe("combined filters & pagination", () => {
    it("supports category + sort + search together", async () => {
      if (skipUnless(ctx, "server") || !categorySlug) return;
      const res = await clientFor(ctx).get(
        `/api/articles?category=${categorySlug}&sort=latest&search=a&limit=5`,
      );
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as ArticleListResponse;
      expect(Array.isArray(data.articles)).toBe(true);
    });

    it("paginates with page and limit", async () => {
      if (skipUnless(ctx, "server")) return;
      const api = clientFor(ctx);
      const page1 = (await parseApiResponse(
        await api.get("/api/articles?limit=3&page=1"),
      )) as ArticleListResponse;
      const page2 = (await parseApiResponse(
        await api.get("/api/articles?limit=3&page=2"),
      )) as ArticleListResponse;

      expect(page1.page).toBe(1);
      expect(page1.limit).toBe(3);
      expect(typeof page1.hasMore).toBe("boolean");

      if (page1.hasMore && page2.articles.length > 0) {
        const page1Ids = new Set(page1.articles.map((a) => a.id));
        for (const article of page2.articles) {
          expect(page1Ids.has(article.id)).toBe(false);
        }
      }
    });

    it("returns excerpt on list items for article cards", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/articles?limit=3");
      const data = (await parseApiResponse(res)) as ArticleListResponse;
      if (data.articles.length > 0) {
        const first = data.articles[0];
        expect("excerpt" in first).toBe(true);
      }
    });
  });
});
