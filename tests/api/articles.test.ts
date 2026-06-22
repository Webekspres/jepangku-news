import { beforeAll, describe, expect, it } from "bun:test";
import {
  fetchPublishedArticle,
  fetchPublishedArticleId,
  fetchPublishedArticleSlug,
} from "../helpers/fixtures";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

const DRAFT_PAYLOAD = {
  title: `Integration Draft ${Date.now()}`,
  excerpt: "Excerpt for integration test",
  content: "<p>Integration test body content.</p>",
  status: "DRAFT",
};

describe("API — articles", () => {
  let ctx: IntegrationContext;
  let publishedSlug: string | null = null;
  let publishedId: string | null = null;
  let createdSlug: string | null = null;

  beforeAll(async () => {
    ctx = await setupIntegration();
    if (!ctx.serverUp) return;
    const guest = clientFor(ctx);
    publishedSlug = await fetchPublishedArticleSlug(guest);
    publishedId = await fetchPublishedArticleId(guest);
  });

  describe("public listing", () => {
    it("GET /api/articles returns published articles", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/articles?limit=3");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { articles: unknown[] };
      expect(Array.isArray(data.articles)).toBe(true);
    });

    it("GET /api/articles supports sort=popular", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/articles?sort=popular&limit=2");
      expect(res.status).toBe(200);
    });

    it("GET /api/articles supports category filter param", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/articles?category=anime&limit=2");
      expect(res.status).toBe(200);
    });

    it("GET /api/articles supports search param", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/articles?search=tokyo&limit=2");
      expect(res.status).toBe(200);
    });
  });

  describe("CRUD — create", () => {
    it("POST /api/articles/create returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).post("/api/articles/create", DRAFT_PAYLOAD);
      expect(res.status).toBe(401);
    });

    it("POST /api/articles/create returns 403 for plain USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/articles/create", DRAFT_PAYLOAD);
      expect(res.status).toBe(403);
    });

    it("POST /api/articles/create creates DRAFT for CONTRIBUTOR", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").post("/api/articles/create", DRAFT_PAYLOAD);
      expect(res.status).toBe(201);
      const article = (await res.json()) as { slug: string; status: string; title: string };
      expect(article.status).toBe("DRAFT");
      expect(article.title).toBe(DRAFT_PAYLOAD.title);
      createdSlug = article.slug;
    });

    it("POST /api/articles/create rejects empty title", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").post("/api/articles/create", {
        ...DRAFT_PAYLOAD,
        title: "",
      });
      expect(res.status).toBe(400);
    });

    it("POST /api/articles/create rejects invalid status", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").post("/api/articles/create", {
        ...DRAFT_PAYLOAD,
        title: `Invalid Status ${Date.now()}`,
        status: "PUBLISHED",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("workflow — my articles", () => {
    it("GET /api/articles/my returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/articles/my");
      expect(res.status).toBe(401);
    });

    it("GET /api/articles/my lists contributor drafts", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").get("/api/articles/my");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { articles: { slug: string }[] };
      expect(Array.isArray(data.articles)).toBe(true);
    });

    it("PUT update returns 403 for non-owner", async () => {
      if (skipUnless(ctx, "auth") || !createdSlug) return;
      const res = await clientFor(ctx, "ADMIN").put(`/api/articles/${createdSlug}/update`, {
        title: "Hijack attempt",
      });
      expect(res.status).toBe(403);
    });

    it("PUT update allows owner to edit DRAFT", async () => {
      if (skipUnless(ctx, "auth") || !createdSlug) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").put(`/api/articles/${createdSlug}/update`, {
        title: `${DRAFT_PAYLOAD.title} (edited)`,
        content: DRAFT_PAYLOAD.content,
      });
      expect(res.status).toBe(200);
    });

    it("PUT update can submit DRAFT to PENDING_REVIEW", async () => {
      if (skipUnless(ctx, "auth") || !createdSlug) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").put(`/api/articles/${createdSlug}/update`, {
        status: "PENDING_REVIEW",
      });
      expect(res.status).toBe(200);
      const article = (await res.json()) as { status: string };
      expect(article.status).toBe("PENDING_REVIEW");
    });
  });

  describe("read-complete", () => {
    it("POST read-complete returns not_authenticated for guest", async () => {
      if (skipUnless(ctx, "server") || !publishedSlug) return;
      const res = await clientFor(ctx).post(`/api/articles/${publishedSlug}/read-complete`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as { awarded: boolean; reason: string };
      expect(body.awarded).toBe(false);
      expect(body.reason).toBe("not_authenticated");
    });

    it("POST read-complete awards or idempotently skips for USER", async () => {
      if (skipUnless(ctx, "auth") || !publishedSlug) return;
      const api = clientFor(ctx, "USER");
      const res = await api.post(`/api/articles/${publishedSlug}/read-complete`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as { awarded: boolean; reason: string };
      expect(["points_awarded", "already_awarded"]).toContain(body.reason);
    });

    it("POST read-complete returns 404 for unknown slug", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post(
        "/api/articles/nonexistent-slug-xyz/read-complete",
      );
      expect(res.status).toBe(404);
    });
  });

  describe("share", () => {
    it("GET share status returns hasShared false for guest", async () => {
      if (skipUnless(ctx, "server") || !publishedSlug) return;
      const res = await clientFor(ctx).get(`/api/articles/${publishedSlug}/share`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as { hasShared: boolean };
      expect(body.hasShared).toBe(false);
    });

    it("POST share returns 401 for guest", async () => {
      if (skipUnless(ctx, "server") || !publishedSlug) return;
      const res = await clientFor(ctx).post(`/api/articles/${publishedSlug}/share`);
      expect(res.status).toBe(401);
    });

    it("POST share tracks or rejects duplicate for USER", async () => {
      if (skipUnless(ctx, "auth") || !publishedSlug) return;
      const api = clientFor(ctx, "USER");
      const first = await api.post(`/api/articles/${publishedSlug}/share`, {
        shareMethod: "copy-link",
      });
      expect([200, 400]).toContain(first.status);
      const second = await api.post(`/api/articles/${publishedSlug}/share`);
      expect(second.status).toBe(400);
    });

    it("POST share returns 404 for unknown article", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/articles/fake-slug/share");
      expect(res.status).toBe(404);
    });
  });

  describe("bookmark", () => {
    it("POST bookmark returns 401 for guest", async () => {
      if (skipUnless(ctx, "server") || !publishedId) return;
      const res = await clientFor(ctx).post(`/api/bookmarks/${publishedId}`);
      expect(res.status).toBe(401);
    });

    it("POST bookmark creates bookmark for USER", async () => {
      if (skipUnless(ctx, "auth") || !publishedId) return;
      const api = clientFor(ctx, "USER");
      const res = await api.post(`/api/bookmarks/${publishedId}`);
      expect([200, 201]).toContain(res.status);
    });

    it("POST bookmark is idempotent (already bookmarked message)", async () => {
      if (skipUnless(ctx, "auth") || !publishedId) return;
      const api = clientFor(ctx, "USER");
      await api.post(`/api/bookmarks/${publishedId}`);
      const res = await api.post(`/api/bookmarks/${publishedId}`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as { message: string };
      expect(body.message).toContain("Already");
    });

    it("DELETE bookmark removes bookmark", async () => {
      if (skipUnless(ctx, "auth") || !publishedId) return;
      const api = clientFor(ctx, "USER");
      await api.post(`/api/bookmarks/${publishedId}`);
      const res = await api.delete(`/api/bookmarks/${publishedId}`);
      expect(res.status).toBe(200);
    });

    it("DELETE bookmark returns 404 when not bookmarked", async () => {
      if (skipUnless(ctx, "auth") || !publishedId) return;
      const api = clientFor(ctx, "USER");
      await api.delete(`/api/bookmarks/${publishedId}`);
      const res = await api.delete(`/api/bookmarks/${publishedId}`);
      expect(res.status).toBe(404);
    });

    it("POST bookmark returns 404 for unknown article id", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post(
        "/api/bookmarks/00000000-0000-0000-0000-000000000099",
      );
      expect(res.status).toBe(404);
    });
  });

  describe("preview & delete boundaries", () => {
    it("GET preview returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/articles/preview/fake-id");
      expect(res.status).toBe(401);
    });

    it("DELETE article returns 401 for guest", async () => {
      if (skipUnless(ctx, "server") || !publishedSlug) return;
      const res = await clientFor(ctx).delete(`/api/articles/${publishedSlug}/delete`);
      expect(res.status).toBe(401);
    });
  });
});
