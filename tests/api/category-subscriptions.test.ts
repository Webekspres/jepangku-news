import { beforeAll, describe, expect, it } from "bun:test";
import { fetchCategoryId, fetchCategorySlug } from "../helpers/fixtures";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

describe("API — category subscriptions", () => {
  let ctx: IntegrationContext;
  let categoryId: string | null = null;
  let categorySlug: string | null = null;

  beforeAll(async () => {
    ctx = await setupIntegration();
    if (!ctx.serverUp) return;
    const api = clientFor(ctx);
    categoryId = await fetchCategoryId(api);
    categorySlug = await fetchCategorySlug(api);
  });

  describe("GET /api/category-subscriptions", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/category-subscriptions");
      expect(res.status).toBe(401);
    });

    it("returns subscriptions list for USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/category-subscriptions");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { subscriptions: unknown[] };
      expect(Array.isArray(data.subscriptions)).toBe(true);
    });
  });

  describe("POST/DELETE subscribe flow", () => {
    it("subscribes and unsubscribes by categoryId", async () => {
      if (skipUnless(ctx, "auth") || !categoryId) return;
      const api = clientFor(ctx, "USER");

      const subscribe = await api.post("/api/category-subscriptions", {
        categoryId,
      });
      expect(subscribe.status).toBe(200);

      const list = await api.get("/api/category-subscriptions");
      const { subscriptions } = (await api.json(list)) as {
        subscriptions: { categoryId: string }[];
      };
      expect(subscriptions.some((s) => s.categoryId === categoryId)).toBe(true);

      const unsubscribe = await api.delete(
        `/api/category-subscriptions?categoryId=${categoryId}`,
      );
      expect(unsubscribe.status).toBe(200);
    });

    it("subscribes by categorySlug", async () => {
      if (skipUnless(ctx, "auth") || !categorySlug) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").post("/api/category-subscriptions", {
        categorySlug,
      });
      expect(res.status).toBe(200);

      await clientFor(ctx, "CONTRIBUTOR").delete(
        `/api/category-subscriptions?categorySlug=${categorySlug}`,
      );
    });
  });
});
