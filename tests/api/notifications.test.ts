import { beforeAll, describe, expect, it } from "bun:test";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

describe("API — notifications", () => {
  let ctx: IntegrationContext;
  let notificationId: string | null = null;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  describe("GET /api/notifications", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/notifications");
      expect(res.status).toBe(401);
    });

    it("returns paginated list for USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/notifications?limit=10");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { items: { id: string }[]; nextCursor: string | null };
      expect(Array.isArray(data.items)).toBe(true);
      notificationId = data.items[0]?.id ?? null;
    });

    it("supports unreadOnly filter", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/notifications?unreadOnly=true");
      expect(res.status).toBe(200);
    });

    it("supports cursor pagination param", async () => {
      if (skipUnless(ctx, "auth")) return;
      const first = await clientFor(ctx, "USER").get("/api/notifications?limit=1");
      const data = (await first.json()) as { nextCursor: string | null };
      if (!data.nextCursor) return;
      const second = await clientFor(ctx, "USER").get(
        `/api/notifications?limit=1&cursor=${encodeURIComponent(data.nextCursor)}`,
      );
      expect(second.status).toBe(200);
    });
  });

  describe("GET /api/notifications/unread-count", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/notifications/unread-count");
      expect(res.status).toBe(401);
    });

    it("returns numeric count for USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/notifications/unread-count");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { count: number };
      expect(typeof data.count).toBe("number");
    });
  });

  describe("PATCH /api/notifications/[id]/read", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).patch("/api/notifications/fake-id/read");
      expect(res.status).toBe(401);
    });

    it("returns 404 for unknown notification", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").patch(
        "/api/notifications/00000000-0000-0000-0000-000000000099/read",
      );
      expect(res.status).toBe(404);
    });

    it("marks notification read when id exists", async () => {
      if (skipUnless(ctx, "auth") || !notificationId) return;
      const res = await clientFor(ctx, "USER").patch(
        `/api/notifications/${notificationId}/read`,
      );
      expect([200, 404]).toContain(res.status);
    });
  });

  describe("POST /api/notifications/read-all", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/notifications/read-all");
      expect(res.status).toBe(401);
    });

    it("marks all read for USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/notifications/read-all");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { updated: number };
      expect(typeof data.updated).toBe("number");
    });
  });

  describe("notification session (Jakarta day bounds)", () => {
    it("GET /api/notifications/session returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/notifications/session");
      expect(res.status).toBe(401);
    });

    it("GET session returns jakartaDate and modal flags", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/notifications/session");
      expect(res.status).toBe(200);
      const session = (await res.json()) as {
        jakartaDate: string;
        showWelcomeModal: boolean;
        showDailyPointsModal: boolean;
      };
      expect(session.jakartaDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof session.showWelcomeModal).toBe("boolean");
      expect(typeof session.showDailyPointsModal).toBe("boolean");
    });

    it("PATCH session dismiss requires valid action", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").patch("/api/notifications/session", {});
      expect(res.status).toBe(400);
    });

    it("PATCH session can dismiss welcome modal", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").patch("/api/notifications/session", {
        dismissWelcome: true,
      });
      expect(res.status).toBe(200);
      const session = (await res.json()) as { showWelcomeModal: boolean };
      expect(session.showWelcomeModal).toBe(false);
    });

    it("PATCH session can dismiss daily points modal", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").patch("/api/notifications/session", {
        dismissDailyPoints: true,
      });
      expect(res.status).toBe(200);
    });
  });

  describe("dedupe behavior (API surface)", () => {
    it("list items have stable ids (no duplicate in page)", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/notifications?limit=50");
      const data = (await res.json()) as { items: { id: string }[] };
      const ids = data.items.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("stream endpoint", () => {
    it("GET /api/notifications/stream returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/notifications/stream");
      expect(res.status).toBe(401);
    });
  });
});
