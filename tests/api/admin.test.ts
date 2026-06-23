import { beforeAll, describe, expect, it } from "bun:test";
import { parseApiResponse } from '@/lib/fetch-api';
import { ADMIN_BOUNDARY_ENDPOINTS } from "../helpers/fixtures";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

describe("API — admin boundary (403 non-admin)", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  describe("guest access", () => {
    for (const { method, path } of ADMIN_BOUNDARY_ENDPOINTS) {
      it(`${method} ${path} returns 403 for guest`, async () => {
        if (skipUnless(ctx, "server")) return;
        const api = clientFor(ctx);
        const res =
          method === "GET" ? await api.get(path) : await api.post(path, {});
        expect(res.status).toBe(403);
      });
    }
  });

  describe("USER role (non-admin)", () => {
    for (const { method, path } of ADMIN_BOUNDARY_ENDPOINTS) {
      it(`${method} ${path} returns 403 for USER`, async () => {
        if (skipUnless(ctx, "auth")) return;
        const api = clientFor(ctx, "USER");
        const res =
          method === "GET" ? await api.get(path) : await api.post(path, {});
        expect(res.status).toBe(403);
      });
    }

    it("USER cannot PATCH admin comment moderation", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").patch(
        "/api/admin/comments/00000000-0000-0000-0000-000000000099",
        { action: "hide" },
      );
      expect(res.status).toBe(403);
    });

    it("USER cannot access admin articles bulk", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/admin/articles/bulk", {
        action: "approve",
        ids: [],
      });
      expect(res.status).toBe(403);
    });
  });

  describe("CONTRIBUTOR role (non-admin)", () => {
    it("GET /api/admin/stats returns 403 for CONTRIBUTOR", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").get("/api/admin/stats");
      expect(res.status).toBe(403);
    });

    it("GET /api/admin/users/stats returns 403 for CONTRIBUTOR", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").get("/api/admin/users/stats");
      expect(res.status).toBe(403);
    });
  });

  describe("ADMIN access (positive boundary)", () => {
    it("GET /api/admin/stats returns 200 for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/stats");
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as { totalArticles: number };
      expect(typeof data.totalArticles).toBe("number");
    });

    it("GET /api/admin/articles returns 200 for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/articles?limit=1");
      expect(res.status).toBe(200);
    });

    it("GET /api/admin/contributors returns 200 for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/contributors?limit=5");
      expect(res.status).toBe(200);
    });

    it("GET /api/admin/polls returns 200 for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/polls?limit=5");
      expect(res.status).toBe(200);
    });

    it("GET /api/admin/quizzes returns 200 for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/quizzes?limit=5");
      expect(res.status).toBe(200);
    });

    it("GET /api/admin/newsletter returns 200 for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/newsletter?limit=5");
      expect(res.status).toBe(200);
    });

    it("GET /api/admin/newsletter/export returns CSV for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/newsletter/export");
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/csv");
    });
  });
});
