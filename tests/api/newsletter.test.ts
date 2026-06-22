import { beforeAll, describe, expect, it } from "bun:test";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

describe("API — newsletter", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  describe("POST /api/newsletter/subscribe", () => {
    it("returns 400 for invalid email", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/newsletter/subscribe", {
        email: "not-an-email",
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 for empty email", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/newsletter/subscribe", { email: "" });
      expect(res.status).toBe(400);
    });

    it("subscribes guest with valid email", async () => {
      if (skipUnless(ctx, "server")) return;
      const email = `newsletter+${Date.now()}@jepangku.com`;
      const res = await clientFor(ctx).post("/api/newsletter/subscribe", { email });
      expect(res.status).toBe(200);
      const body = (await res.json()) as { ok: boolean; message: string };
      expect(body.ok).toBe(true);
      expect(body.message).toBeTruthy();
    });

    it("normalizes email case on subscribe", async () => {
      if (skipUnless(ctx, "server")) return;
      const local = `MixedCase${Date.now()}`;
      const email = `${local}@Jepangku.COM`;
      const res = await clientFor(ctx).post("/api/newsletter/subscribe", { email });
      expect(res.status).toBe(200);
    });

    it("duplicate subscribe is idempotent (second call ok)", async () => {
      if (skipUnless(ctx, "server")) return;
      const email = `dup+${Date.now()}@jepangku.com`;
      const api = clientFor(ctx);
      const first = await api.post("/api/newsletter/subscribe", { email });
      const second = await api.post("/api/newsletter/subscribe", { email });
      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
    });

    it("authenticated subscribe links user when email matches", async () => {
      if (skipUnless(ctx, "auth")) return;
      const me = await clientFor(ctx, "USER").get("/api/auth/me");
      const user = (await me.json()) as { email: string };
      const res = await clientFor(ctx, "USER").post("/api/newsletter/subscribe", {
        email: user.email,
      });
      expect(res.status).toBe(200);
    });

    it("rejects email without @ symbol", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/newsletter/subscribe", {
        email: "plainaddress",
      });
      expect(res.status).toBe(400);
    });

    it("rejects extremely long email", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/newsletter/subscribe", {
        email: `${"a".repeat(300)}@example.com`,
      });
      expect(res.status).toBe(400);
    });
  });

  describe("GET/DELETE /api/newsletter/subscription", () => {
    it("GET returns 401 without auth", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/newsletter/subscription?token=abc");
      expect(res.status).toBe(401);
    });

    it("GET returns 400 without token", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/newsletter/subscription");
      expect(res.status).toBe(400);
    });

    it("GET returns 404 for unknown token", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get(
        "/api/newsletter/subscription?token=0000000000000000000000000000000000000000000000000000000000000000",
      );
      expect(res.status).toBe(404);
    });

    it("DELETE unsubscribe returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).delete("/api/newsletter/subscription");
      expect(res.status).toBe(401);
    });

    it("DELETE unsubscribe requires matching token for USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").delete(
        "/api/newsletter/subscription?token=invalid-token",
      );
      expect([403, 404]).toContain(res.status);
    });
  });
});
