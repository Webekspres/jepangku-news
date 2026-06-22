import { beforeAll, describe, expect, it } from "bun:test";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

describe("API — points", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  describe("GET /api/points/my", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/points/my");
      expect(res.status).toBe(401);
    });

    it("returns ledger shape for authenticated USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/points/my");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        totalPoints: number;
        transactions: {
          id: string;
          activityType: string;
          points: number;
          occurredAt: string;
        }[];
      };
      expect(typeof data.totalPoints).toBe("number");
      expect(Array.isArray(data.transactions)).toBe(true);
    });

    it("transaction entries include required fields", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/points/my");
      const data = (await res.json()) as { transactions: Record<string, unknown>[] };
      if (data.transactions.length > 0) {
        const tx = data.transactions[0]!;
        expect(tx).toHaveProperty("activityType");
        expect(tx).toHaveProperty("sourceType");
        expect(tx).toHaveProperty("points");
        expect(tx).toHaveProperty("occurredAt");
      }
    });

    it("returns ledger for CONTRIBUTOR", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").get("/api/points/my");
      expect(res.status).toBe(200);
    });

    it("returns ledger for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/points/my");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/points/export", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/points/export");
      expect(res.status).toBe(401);
    });

    it("returns CSV for authenticated USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/points/export");
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/csv");
      expect(res.headers.get("content-disposition")).toContain("riwayat-poin.csv");
    });

    it("CSV includes header row", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/points/export");
      const csv = await res.text();
      const firstLine = csv.split("\n")[0] ?? "";
      expect(firstLine).toContain("activityType");
      expect(firstLine).toContain("points");
      expect(firstLine).toContain("occurredAt");
    });

    it("CSV rows align with column count", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/points/export");
      const lines = (await res.text()).split("\n").filter(Boolean);
      if (lines.length > 1) {
        const headerCols = lines[0]!.split(",").length;
        const rowCols = lines[1]!.split(",").length;
        expect(rowCols).toBe(headerCols);
      }
    });

    it("export available for CONTRIBUTOR", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").get("/api/points/export");
      expect(res.status).toBe(200);
    });
  });

  describe("public leaderboard", () => {
    it("GET /api/leaderboard returns weekly period", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/leaderboard?period=weekly&limit=3");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { period: string; items: unknown[] };
      expect(data.period).toBe("weekly");
      expect(Array.isArray(data.items)).toBe(true);
    });

    it("GET /api/leaderboard/weekly is alias endpoint", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/leaderboard/weekly?limit=3");
      expect(res.status).toBe(200);
    });

    it("GET /api/leaderboard supports monthly period", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/leaderboard?period=monthly&limit=5");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { period: string; items: { rank: number }[] };
      expect(data.period).toBe("monthly");
      if (data.items.length > 1) {
        expect(data.items[0]!.rank).toBeLessThan(data.items[1]!.rank);
      }
    });

    it("GET /api/leaderboard supports all-time period", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/leaderboard?period=sepanjang-waktu&limit=5");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { period: string; items: { rank: number }[] };
      expect(data.period).toBe("sepanjang-waktu");
      if (data.items.length > 1) {
        expect(data.items[0]!.rank).toBeLessThan(data.items[1]!.rank);
      }
    });
  });

  describe("activity feed", () => {
    it("GET /api/activity/feed returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/activity/feed");
      expect(res.status).toBe(401);
    });

    it("GET /api/activity/feed returns items for USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/activity/feed");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { items: { kind: string }[] };
      expect(Array.isArray(data.items)).toBe(true);
    });
  });

  describe("admin gamification", () => {
    it("GET /api/admin/points returns 403 for USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/admin/points?period=30d");
      expect(res.status).toBe(403);
    });

    it("GET /api/admin/points returns summary for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/points?period=7d");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        period: string;
        recentTransactions: unknown[];
      };
      expect(data.period).toBe("7d");
      expect(Array.isArray(data.recentTransactions)).toBe(true);
    });

    it("GET /api/admin/leaderboard returns snapshot for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get(
        "/api/admin/leaderboard?period=weekly&limit=10",
      );
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        items: { rank: number }[];
        stats: { participants: number };
      };
      expect(Array.isArray(data.items)).toBe(true);
      expect(typeof data.stats.participants).toBe("number");
    });
  });

  describe("gamification endpoint", () => {
    it("GET /api/user/gamification returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/user/gamification");
      expect(res.status).toBe(401);
    });

    it("GET /api/user/gamification returns balance for USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/user/gamification");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { totalPoints: number };
      expect(typeof data.totalPoints).toBe("number");
    });
  });
});
