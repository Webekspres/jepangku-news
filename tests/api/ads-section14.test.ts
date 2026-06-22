import { beforeAll, describe, expect, it } from "bun:test";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";
import type { HomeAdResponse } from "@/lib/home/types";

const TEST_IMAGE =
  "https://images.unsplash.com/photo-1493976040374-85c8e712f73c?w=1200";

describe("API — §14 Iklan & monetisasi", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  describe("14.1 — homepage ad slot banner atau null", () => {
    it("GET /api/home/ads?slot=homepage-mid returns slot + banner shape", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/ads?slot=homepage-mid");
      expect(res.status).toBe(200);
      const data = (await res.json()) as HomeAdResponse;
      expect(data.slot).toBe("homepage-mid");
      if (data.banner) {
        expect(typeof data.banner.id).toBe("string");
        expect(typeof data.banner.imageUrl).toBe("string");
        expect(data.banner.position).toBe("homepage-mid");
      } else {
        expect(data.banner).toBeNull();
      }
    });

    it("rejects invalid slot with 400", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/ads?slot=invalid-slot");
      expect(res.status).toBe(400);
    });

    it("sets Cache-Control for CDN caching", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/ads?slot=homepage-mid");
      const cache = res.headers.get("cache-control") ?? "";
      expect(cache).toMatch(/s-maxage/);
    });
  });

  describe("14.2 — article-sidebar slot", () => {
    it("GET /api/home/ads?slot=article-sidebar returns correct slot key", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get(
        "/api/home/ads?slot=article-sidebar",
      );
      expect(res.status).toBe(200);
      const data = (await res.json()) as HomeAdResponse;
      expect(data.slot).toBe("article-sidebar");
      if (data.banner) {
        expect(data.banner.position).toBe("article-sidebar");
      }
    });
  });

  describe("14.3 — admin CRUD aktif/nonaktif · jadwal", () => {
    it("POST creates, PATCH toggles isActive, DELETE removes", async () => {
      if (skipUnless(ctx, "auth")) return;
      const admin = clientFor(ctx, "ADMIN");
      const title = `§14 Test Banner ${Date.now()}`;
      const startAt = "2026-01-01T00:00:00.000Z";
      const endAt = "2027-12-31T23:59:59.000Z";

      const createRes = await admin.post("/api/admin/ads", {
        position: "homepage-mid",
        title,
        imageUrl: TEST_IMAGE,
        linkUrl: "https://example.com/partner",
        altText: "Integration test banner",
        isActive: true,
        startAt,
        endAt,
        sortOrder: 99,
      });
      expect(createRes.status).toBe(201);
      const { id } = (await createRes.json()) as { id: string };

      const detailRes = await admin.get(`/api/admin/ads/${id}`);
      expect(detailRes.status).toBe(200);
      const detail = (await detailRes.json()) as {
        title: string;
        isActive: boolean;
        startAt: string;
        endAt: string;
      };
      expect(detail.title).toBe(title);
      expect(detail.isActive).toBe(true);
      expect(detail.startAt).toBeTruthy();
      expect(detail.endAt).toBeTruthy();

      const deactivateRes = await admin.patch(`/api/admin/ads/${id}`, {
        isActive: false,
      });
      expect(deactivateRes.status).toBe(200);

      const inactive = await admin.get(`/api/admin/ads/${id}`);
      expect((await inactive.json()).isActive).toBe(false);

      const deleteRes = await admin.delete(`/api/admin/ads/${id}`);
      expect(deleteRes.status).toBe(200);

      const goneRes = await admin.get(`/api/admin/ads/${id}`);
      expect(goneRes.status).toBe(404);
    });

    it("GET /api/admin/ads returns 403 for USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/admin/ads");
      expect(res.status).toBe(403);
    });

    it("GET /api/admin/ads/stats returns counts for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/ads/stats");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { total: number; active: number };
      expect(typeof data.total).toBe("number");
      expect(typeof data.active).toBe("number");
    });
  });
});
