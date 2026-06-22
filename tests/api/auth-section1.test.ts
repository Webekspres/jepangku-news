import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { CLERK_TEST_ACCOUNTS } from "../fixtures/clerk-accounts";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

setDefaultTimeout(20_000);

/**
 * Functional checklist §1 — Autentikasi & akun (API/integration layer).
 * Browser flows: e2e/auth.spec.ts + e2e/auth-section1.spec.ts
 */
describe("§1 Autentikasi & akun — API checklist", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
  }, 60_000);

  describe("1.4 GET /api/auth/me", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("returns correct seeded USER profile", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/auth/me");
      expect(res.status).toBe(200);
      const user = (await res.json()) as {
        id: string;
        email: string;
        role: string;
        totalPoints: number;
        currentLevel: number;
      };
      expect(user.email).toBe(CLERK_TEST_ACCOUNTS.USER.email);
      expect(user.role).toBe("USER");
      expect(typeof user.id).toBe("string");
      expect(user.id.length).toBeGreaterThan(0);
      expect(typeof user.totalPoints).toBe("number");
      expect(typeof user.currentLevel).toBe("number");
    });
  });

  describe("1.2 JIT provisioning News DB", () => {
    it("authenticated /api/auth/me returns persisted portal user id", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/auth/me");
      const user = (await res.json()) as { id: string; email: string };
      expect(user.id).toBeTruthy();
      expect(user.email).toBe(CLERK_TEST_ACCOUNTS.USER.email);
    });
  });

  describe("1.3 Logout", () => {
    it("POST /api/auth/logout returns ok for authenticated user", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/auth/logout");
      expect(res.status).toBe(200);
      const body = (await res.json()) as { ok: boolean };
      expect(body.ok).toBe(true);
    });
  });

  describe("1.6 Deprecated local auth (410)", () => {
    it("POST /api/auth/login returns 410 LOCAL_AUTH_DISABLED", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/auth/login");
      expect(res.status).toBe(410);
      const body = (await res.json()) as { code: string };
      expect(body.code).toBe("LOCAL_AUTH_DISABLED");
    });

    it("POST /api/auth/register returns 410 LOCAL_AUTH_DISABLED", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/auth/register");
      expect(res.status).toBe(410);
      const body = (await res.json()) as { code: string };
      expect(body.code).toBe("LOCAL_AUTH_DISABLED");
    });
  });

  describe("1.8 Route admin — API boundary", () => {
    it("GET /api/admin/stats returns 403 for USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/admin/stats");
      expect(res.status).toBe(403);
    });

    it("GET /api/admin/stats returns 200 for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/stats");
      expect(res.status).toBe(200);
    });
  });

  describe("1.9 Core JWT — token after login", () => {
    it("may set core_session cookie on /api/auth/me when Core is configured", async () => {
      if (skipUnless(ctx, "auth")) return;
      if (!process.env.CORE_API_URL?.trim()) return;

      const res = await clientFor(ctx, "USER").get("/api/auth/me");
      expect(res.status).toBe(200);
      const setCookie = res.headers.get("set-cookie") ?? "";
      if (setCookie.includes("core_session")) {
        expect(setCookie).toContain("HttpOnly");
      }
    });

    it("session user includes gamification fields without Core exchange", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/auth/me");
      const user = (await res.json()) as Record<string, unknown>;
      expect(user).toHaveProperty("totalPoints");
      expect(user).toHaveProperty("currentLevel");
      expect(user).toHaveProperty("coreRoles");
    });
  });

  describe("1.10 Core down — portal tetap jalan", () => {
    it("GET /api/health succeeds independently of Core", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/health");
      expect(res.status).toBe(200);
      const body = (await res.json()) as { status: string; db: string };
      expect(body.status).toBe("ok");
      expect(body.db).toBe("ok");
    });

    it("authenticated /api/auth/me succeeds when Core exchange may fail", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/auth/me");
      expect(res.status).toBe(200);
    });

    it("GET /api/home/feed is reachable without Core session", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/feed");
      expect(res.status).toBe(200);
    });
  });
});
