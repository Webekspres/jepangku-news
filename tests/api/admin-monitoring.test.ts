import { beforeAll, describe, expect, it } from "bun:test";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

type DashboardStats = {
  totalArticles: number;
  pendingArticles: number;
  publishedArticles: number;
  totalUsers: number;
  totalQuizzes: number;
  totalPolls: number;
  charts: {
    articleStatus: Array<{ label: string; value: number }>;
    viewsByDay: Array<{ date: string; count: number }>;
    userRegistrationsByDay: Array<{ date: string; count: number }>;
  };
};

type UsersStats = {
  total: number;
  active: number;
  banned: number;
  inactive: number;
  draft: number;
};

type ActivityLogResponse = {
  entries: Array<{
    id: string;
    category: string;
    summary: string;
    occurredAt: string;
  }>;
  page: number;
  totalPages: number;
  total: number;
};

type UserGrowthResponse = {
  period: string;
  granularity: string;
  series: Array<{ date: string; count: number }>;
  totalUsers: number;
  newInPeriod: number;
};

describe("API — §15 admin dashboard & monitoring", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  describe("15.2 Stats API — angka konsisten", () => {
    it("GET /api/admin/stats returns counts aligned with users/stats", async () => {
      if (skipUnless(ctx, "auth")) return;

      const [statsRes, usersStatsRes] = await Promise.all([
        clientFor(ctx, "ADMIN").get("/api/admin/stats"),
        clientFor(ctx, "ADMIN").get("/api/admin/users/stats"),
      ]);

      expect(statsRes.status).toBe(200);
      expect(usersStatsRes.status).toBe(200);

      const stats = (await statsRes.json()) as DashboardStats;
      const usersStats = (await usersStatsRes.json()) as UsersStats;

      expect(typeof stats.totalArticles).toBe("number");
      expect(typeof stats.pendingArticles).toBe("number");
      expect(typeof stats.publishedArticles).toBe("number");
      expect(stats.totalUsers).toBe(usersStats.total);

      const statusSum = stats.charts.articleStatus.reduce(
        (sum, row) => sum + row.value,
        0,
      );
      expect(statusSum).toBe(stats.totalArticles);
      expect(stats.pendingArticles + stats.publishedArticles).toBeLessThanOrEqual(
        stats.totalArticles,
      );
    });
  });

  describe("15.3 Activity log — audit artikel & kontributor", () => {
    it("GET /api/admin/activity-log returns paginated audit entries", async () => {
      if (skipUnless(ctx, "auth")) return;

      const res = await clientFor(ctx, "ADMIN").get("/api/admin/activity-log?page=1");
      expect(res.status).toBe(200);

      const data = (await res.json()) as ActivityLogResponse;
      expect(Array.isArray(data.entries)).toBe(true);
      expect(data.page).toBe(1);
      expect(typeof data.total).toBe("number");
      expect(typeof data.totalPages).toBe("number");
    });

    it("GET /api/admin/activity-log supports article and contributor filters", async () => {
      if (skipUnless(ctx, "auth")) return;

      for (const category of ["article", "contributor"]) {
        const res = await clientFor(ctx, "ADMIN").get(
          `/api/admin/activity-log?category=${category}&page=1`,
        );
        expect(res.status).toBe(200);
        const data = (await res.json()) as ActivityLogResponse;
        expect(Array.isArray(data.entries)).toBe(true);
        for (const entry of data.entries) {
          expect(entry.category).toBe(category);
        }
      }
    });
  });

  describe("15.5 Manajemen user — list · detail · role", () => {
    it("GET /api/admin/users returns user list", async () => {
      if (skipUnless(ctx, "auth")) return;

      const res = await clientFor(ctx, "ADMIN").get("/api/admin/users");
      expect(res.status).toBe(200);

      const data = (await res.json()) as Array<{ id: string; role: string }>;
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty("id");
        expect(data[0]).toHaveProperty("role");
      }
    });

    it("GET /api/admin/users/{id} returns detail with stats", async () => {
      if (skipUnless(ctx, "auth")) return;

      const listRes = await clientFor(ctx, "ADMIN").get("/api/admin/users");
      const users = (await listRes.json()) as Array<{ id: string }>;
      if (users.length === 0) return;

      const res = await clientFor(ctx, "ADMIN").get(`/api/admin/users/${users[0].id}`);
      expect(res.status).toBe(200);

      const data = (await res.json()) as {
        user: { id: string; role: string };
        stats: { articleCount: number };
        articles: unknown[];
      };
      expect(data.user.id).toBe(users[0].id);
      expect(data.user).toHaveProperty("role");
      expect(data).toHaveProperty("stats");
      expect(Array.isArray(data.articles)).toBe(true);
    });
  });

  describe("15.6 User growth API — data chart", () => {
    it("GET /api/admin/users/growth returns series for chart", async () => {
      if (skipUnless(ctx, "auth")) return;

      const res = await clientFor(ctx, "ADMIN").get(
        "/api/admin/users/growth?period=30d&granularity=day",
      );
      expect(res.status).toBe(200);

      const data = (await res.json()) as UserGrowthResponse;
      expect(data.period).toBe("30d");
      expect(data.granularity).toBe("day");
      expect(Array.isArray(data.series)).toBe(true);
      expect(data.series.length).toBeGreaterThan(0);
      expect(typeof data.totalUsers).toBe("number");
      expect(typeof data.newInPeriod).toBe("number");

      const registrations = data.series.reduce((sum, row) => sum + row.count, 0);
      expect(registrations).toBe(data.newInPeriod);
    });

    it("GET /api/admin/users/growth returns 403 for non-admin", async () => {
      if (skipUnless(ctx, "auth")) return;

      const res = await clientFor(ctx, "USER").get("/api/admin/users/growth");
      expect(res.status).toBe(403);
    });
  });
});
