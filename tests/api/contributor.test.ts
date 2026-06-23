import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { parseApiResponse } from '@/lib/fetch-api';
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";
import { resetClerkUserContributorApplications } from "../helpers/contributor-test";

const VALID_MOTIVATION =
  "Saya ingin berkontribusi artikel tentang budaya dan bahasa Jepang untuk komunitas Jepangku.";

describe("API — contributor", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
    if (ctx.serverUp) {
      await resetClerkUserContributorApplications();
    }
  });

  describe("GET /api/contributor/status", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/contributor/status");
      expect(res.status).toBe(401);
    });

    it("CONTRIBUTOR account reports isContributor true", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").get("/api/contributor/status");
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as { isContributor: boolean };
      expect(data.isContributor).toBe(true);
    });

    it("ADMIN account can create articles (isContributor true)", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/contributor/status");
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as { isContributor: boolean };
      expect(data.isContributor).toBe(true);
    });

    it("USER account reports isContributor false", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/contributor/status");
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as { isContributor: boolean };
      expect(data.isContributor).toBe(false);
    });
  });

  describe("POST /api/contributor/apply", () => {
    beforeEach(async () => {
      if (!ctx.serverUp) return;
      await resetClerkUserContributorApplications();
    });

    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/contributor/apply", {
        motivation: VALID_MOTIVATION,
      });
      expect(res.status).toBe(401);
    });

    it("returns 400 for CONTRIBUTOR who already has access", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").post("/api/contributor/apply", {
        motivation: VALID_MOTIVATION,
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 for motivation too short", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/contributor/apply", {
        motivation: "pendek",
      });
      expect(res.status).toBe(400);
      const body = (await parseApiResponse(res)) as { code: string };
      expect(body.code).toBe("MOTIVATION_TOO_SHORT");
    });

    it("returns 400 for invalid portfolio URL", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/contributor/apply", {
        motivation: VALID_MOTIVATION,
        portfolioUrl: "ftp://bad-url.example",
      });
      expect(res.status).toBe(400);
      const body = (await parseApiResponse(res)) as { code: string };
      expect(body.code).toBe("INVALID_PORTFOLIO_URL");
    });

    it("accepts valid https portfolio URL", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/contributor/apply", {
        motivation: VALID_MOTIVATION,
        portfolioUrl: "https://example.com/portfolio",
      });
      expect([201, 409]).toContain(res.status);
    });
  });

  describe("contributor gate on article create", () => {
    it("USER cannot POST /api/articles/create (403 gate)", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/articles/create", {
        title: "Gate test",
        content: "<p>Body</p>",
      });
      expect(res.status).toBe(403);
    });

    it("CONTRIBUTOR can POST /api/articles/create", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").post("/api/articles/create", {
        title: `Gate pass ${Date.now()}`,
        content: "<p>Contributor body</p>",
        status: "DRAFT",
      });
      expect(res.status).toBe(201);
    });
  });
});
