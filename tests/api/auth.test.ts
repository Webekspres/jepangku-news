import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { parseApiResponse, readApiJson } from '@/lib/fetch-api';
import {
  clientFor,
  setupIntegration,
  skipUnless,
  hasRoleToken,
  type IntegrationContext,
} from "../helpers/integration";

setDefaultTimeout(20_000);

describe("API — auth", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
  }, 60_000);

  describe("GET /api/auth/me", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/auth/me");
      expect(res.status).toBe(401);
      const body = await readApiJson(res);
      expect(body).toMatchObject({
        success: false,
        message: expect.any(String),
      });
    });

    it("returns user profile for authenticated USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/auth/me");
      expect(res.status).toBe(200);
      const user = (await parseApiResponse(res)) as { id: string; email: string; role: string };
      expect(user.id).toBeTruthy();
      expect(user.email).toContain("@");
      expect(user.role).toBe("USER");
    });

    it("returns ADMIN role for admin account", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/auth/me");
      expect(res.status).toBe(200);
      const user = (await parseApiResponse(res)) as { role: string };
      expect(user.role).toBe("ADMIN");
    });

    it("returns CONTRIBUTOR role for contributor account", async () => {
      if (skipUnless(ctx, "auth")) return;
      if (!hasRoleToken(ctx, "CONTRIBUTOR")) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").get("/api/auth/me");
      expect(res.status).toBe(200);
      const user = (await parseApiResponse(res)) as { role: string };
      expect(user.role).toBe("CONTRIBUTOR");
    });

    it("includes gamification fields in session user", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/auth/me");
      const user = (await parseApiResponse(res)) as Record<string, unknown>;
      expect(user).toHaveProperty("totalPoints");
      expect(user).toHaveProperty("currentLevel");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("returns ok for guest (clears core cookie)", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/auth/logout");
      expect(res.status).toBe(200);
      const body = await parseApiResponse(res);
      expect(body).toMatchObject({ ok: true });
    });

    it("returns ok for authenticated user", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/auth/logout");
      expect(res.status).toBe(200);
      const body = await parseApiResponse(res);
      expect(body).toMatchObject({ ok: true });
    });
  });

  describe("deprecated local auth (410)", () => {
    it("POST /api/auth/login returns 410", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/auth/login", { email: "a@b.com" });
      expect(res.status).toBe(410);
      const body = (await readApiJson(res)) as { code: string; success: boolean };
      expect(body.code).toBe("LOCAL_AUTH_DISABLED");
    });

    it("POST /api/auth/register returns 410", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/auth/register", { email: "a@b.com" });
      expect(res.status).toBe(410);
      const body = (await readApiJson(res)) as { code: string; success: boolean };
      expect(body.code).toBe("LOCAL_AUTH_DISABLED");
    });

    it("login 410 includes redirect hint message", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/auth/login");
      const body = (await readApiJson(res)) as { message: string; success: boolean };
      expect(body.message.toLowerCase()).toContain("clerk");
    });

    it("register 410 includes redirect hint message", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/auth/register");
      const body = (await readApiJson(res)) as { message: string; success: boolean };
      expect(body.message.toLowerCase()).toContain("clerk");
    });
  });

  describe("401 boundary", () => {
    const protectedGetPaths = [
      "/api/points/my",
      "/api/articles/my",
      "/api/notifications",
      "/api/contributor/status",
      "/api/user/profile",
      "/api/bookmarks",
    ];

    for (const path of protectedGetPaths) {
      it(`GET ${path} returns 401 for guest`, async () => {
        if (skipUnless(ctx, "server")) return;
        const res = await clientFor(ctx).get(path);
        expect(res.status).toBe(401);
      });
    }

    it("invalid Bearer token is treated as guest on /api/auth/me", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await fetch(`${ctx.baseUrl}/api/auth/me`, {
        headers: { Authorization: "Bearer invalid-token-xyz" },
      });
      expect(res.status).toBe(401);
    });
  });

  describe("health probe", () => {
    it("GET /api/health returns ok status", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/health");
      expect(res.status).toBe(200);
      const body = (await parseApiResponse(res)) as { status: string; db: string };
      expect(body.status).toBe("ok");
      expect(body.db).toBe("ok");
    });
  });
});
