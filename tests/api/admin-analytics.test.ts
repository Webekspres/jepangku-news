import { beforeAll, describe, expect, it } from "bun:test";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

type AnalyticsOverviewStats = {
  dailyViews: number;
  lifetimeViews: number;
  quizAttempts: number;
  pollVotes: number;
  activeQuizzes: number;
  activePolls: number;
  totalUsers: number;
  activeUsers: number;
};

type ContentPerformanceRow = {
  id: string;
  title: string;
  periodViews: number;
  periodBookmarks: number;
  periodShares: number;
  lifetimeViews: number;
};

type CategoryAnalyticsRow = {
  id: string;
  name: string;
  articleCount: number;
  totalViews: number;
  engagement: number;
};

type ArticleAnalyticsResponse = {
  article: { id: string; title: string; slug: string };
  period: string;
  periodLabel: string;
  series: Array<{ date: string; totalViews: number; uniqueVisitors: number }>;
  totalViews: number;
  uniqueVisitors: number;
  lifetimeViews: number;
};

type ArticleStatsAggregate = {
  total: number;
  pendingReview: number;
  published: number;
  rejected: number;
  archived: number;
  totalViews: number;
  missingCategory: number;
};

describe("API — §17 admin analytics", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  describe("17.1 Ringkasan — KPI utama", () => {
    it("GET /api/admin/analytics/stats returns overview KPIs", async () => {
      if (skipUnless(ctx, "auth")) return;

      const res = await clientFor(ctx, "ADMIN").get("/api/admin/analytics/stats");
      expect(res.status).toBe(200);

      const data = (await res.json()) as AnalyticsOverviewStats;
      expect(typeof data.dailyViews).toBe("number");
      expect(typeof data.lifetimeViews).toBe("number");
      expect(typeof data.quizAttempts).toBe("number");
      expect(typeof data.pollVotes).toBe("number");
      expect(typeof data.totalUsers).toBe("number");
      expect(typeof data.activeUsers).toBe("number");
      expect(data.dailyViews).toBeGreaterThanOrEqual(0);
      expect(data.lifetimeViews).toBeGreaterThanOrEqual(0);
    });

    it("GET /api/admin/analytics/stats returns 403 for non-admin", async () => {
      if (skipUnless(ctx, "auth")) return;

      const res = await clientFor(ctx, "USER").get("/api/admin/analytics/stats");
      expect(res.status).toBe(403);
    });
  });

  describe("17.2 Content ranking — sort performa", () => {
    it("GET /api/admin/analytics/content returns rows sorted by views", async () => {
      if (skipUnless(ctx, "auth")) return;

      const res = await clientFor(ctx, "ADMIN").get(
        "/api/admin/analytics/content?period=30d&sort=views&limit=10",
      );
      expect(res.status).toBe(200);

      const data = (await res.json()) as {
        period: string;
        sort: string;
        rows: ContentPerformanceRow[];
      };
      expect(data.period).toBe("30d");
      expect(data.sort).toBe("views");
      expect(Array.isArray(data.rows)).toBe(true);

      for (let i = 1; i < data.rows.length; i++) {
        expect(data.rows[i - 1].periodViews).toBeGreaterThanOrEqual(
          data.rows[i].periodViews,
        );
      }
    });

    it("GET /api/admin/analytics/content supports bookmarks sort", async () => {
      if (skipUnless(ctx, "auth")) return;

      const res = await clientFor(ctx, "ADMIN").get(
        "/api/admin/analytics/content?period=all&sort=bookmarks&limit=10",
      );
      expect(res.status).toBe(200);

      const data = (await res.json()) as { sort: string; rows: ContentPerformanceRow[] };
      expect(data.sort).toBe("bookmarks");

      for (let i = 1; i < data.rows.length; i++) {
        expect(data.rows[i - 1].periodBookmarks).toBeGreaterThanOrEqual(
          data.rows[i].periodBookmarks,
        );
      }
    });
  });

  describe("17.3 Per kategori — breakdown", () => {
    it("GET /api/admin/analytics/categories returns category aggregates", async () => {
      if (skipUnless(ctx, "auth")) return;

      const res = await clientFor(ctx, "ADMIN").get("/api/admin/analytics/categories");
      expect(res.status).toBe(200);

      const data = (await res.json()) as { categories: CategoryAnalyticsRow[] };
      expect(Array.isArray(data.categories)).toBe(true);

      for (const cat of data.categories) {
        expect(cat).toHaveProperty("id");
        expect(cat).toHaveProperty("name");
        expect(typeof cat.articleCount).toBe("number");
        expect(typeof cat.totalViews).toBe("number");
        expect(typeof cat.engagement).toBe("number");
        expect(cat.engagement).toBeGreaterThanOrEqual(0);
      }

      for (let i = 1; i < data.categories.length; i++) {
        expect(data.categories[i - 1].totalViews).toBeGreaterThanOrEqual(
          data.categories[i].totalViews,
        );
      }
    });
  });

  describe("17.4 Per artikel — grafik views harian", () => {
    it("GET /api/admin/analytics/articles/{id} returns daily view series", async () => {
      if (skipUnless(ctx, "auth")) return;

      const listRes = await clientFor(ctx, "ADMIN").get(
        "/api/admin/analytics/content?period=30d&sort=views&limit=1",
      );
      const listData = (await listRes.json()) as { rows: ContentPerformanceRow[] };
      if (listData.rows.length === 0) return;

      const articleId = listData.rows[0].id;
      const res = await clientFor(ctx, "ADMIN").get(
        `/api/admin/analytics/articles/${articleId}?period=30d`,
      );
      expect(res.status).toBe(200);

      const data = (await res.json()) as ArticleAnalyticsResponse;
      expect(data.article.id).toBe(articleId);
      expect(data.period).toBe("30d");
      expect(Array.isArray(data.series)).toBe(true);
      expect(typeof data.totalViews).toBe("number");
      expect(typeof data.uniqueVisitors).toBe("number");
      expect(typeof data.lifetimeViews).toBe("number");

      for (const point of data.series) {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof point.totalViews).toBe("number");
        expect(typeof point.uniqueVisitors).toBe("number");
        expect(point.uniqueVisitors).toBeLessThanOrEqual(point.totalViews);
      }
    });

    it("GET /api/admin/analytics/articles/{id} returns 404 for unknown article", async () => {
      if (skipUnless(ctx, "auth")) return;

      const res = await clientFor(ctx, "ADMIN").get(
        "/api/admin/analytics/articles/00000000-0000-0000-0000-000000000099",
      );
      expect(res.status).toBe(404);
    });
  });

  describe("17.5 Artikel stats API — aggregate", () => {
    it("GET /api/admin/articles/stats returns aggregate counts", async () => {
      if (skipUnless(ctx, "auth")) return;

      const res = await clientFor(ctx, "ADMIN").get("/api/admin/articles/stats");
      expect(res.status).toBe(200);

      const data = (await res.json()) as ArticleStatsAggregate;
      expect(typeof data.total).toBe("number");
      expect(typeof data.pendingReview).toBe("number");
      expect(typeof data.published).toBe("number");
      expect(typeof data.rejected).toBe("number");
      expect(typeof data.archived).toBe("number");
      expect(typeof data.totalViews).toBe("number");
      expect(typeof data.missingCategory).toBe("number");

      const statusSum =
        data.pendingReview + data.published + data.rejected + data.archived;
      expect(statusSum).toBeLessThanOrEqual(data.total);
    });

    it("GET /api/admin/articles/stats returns 403 for non-admin", async () => {
      if (skipUnless(ctx, "auth")) return;

      const res = await clientFor(ctx, "USER").get("/api/admin/articles/stats");
      expect(res.status).toBe(403);
    });
  });
});
