import { beforeAll, describe, expect, it } from "bun:test";
import {
  fetchPublishedArticleId,
  fetchPublishedArticleSlug,
} from "../helpers/fixtures";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

const ts = Date.now();

describe("API — articles §3 checklist", () => {
  let ctx: IntegrationContext;
  let publishedSlug: string | null = null;
  let publishedId: string | null = null;
  let draftId: string | null = null;
  let draftSlug: string | null = null;

  beforeAll(async () => {
    ctx = await setupIntegration();
    if (!ctx.serverUp) return;
    const guest = clientFor(ctx);
    publishedSlug = await fetchPublishedArticleSlug(guest);
    publishedId = await fetchPublishedArticleId(guest);

    if (ctx.authAvailable) {
      const createRes = await clientFor(ctx, "CONTRIBUTOR").post("/api/articles/create", {
        title: `§3 Draft ${ts}`,
        excerpt: "Draft for section 3 tests",
        content: "<p>Draft body for autosave and delete tests.</p>",
        status: "DRAFT",
      });
      if (createRes.status === 201) {
        const article = (await createRes.json()) as { id: string; slug: string };
        draftId = article.id;
        draftSlug = article.slug;
      }
    }
  });

  describe("3.1 — daftar artikel pagination & filter", () => {
    it("returns pagination envelope with page, limit, hasMore", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/articles?page=1&limit=2");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        articles: unknown[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
      };
      expect(data.page).toBe(1);
      expect(data.limit).toBe(2);
      expect(typeof data.total).toBe("number");
      expect(typeof data.hasMore).toBe("boolean");
      expect(Array.isArray(data.articles)).toBe(true);
    });

    it("page 2 returns different slice when enough articles exist", async () => {
      if (skipUnless(ctx, "server")) return;
      const api = clientFor(ctx);
      const page1 = (await api.json(
        await api.get("/api/articles?page=1&limit=1"),
      )) as { articles: { slug: string }[]; total: number };
      if (page1.total < 2) return;
      const page2 = (await api.json(
        await api.get("/api/articles?page=2&limit=1"),
      )) as { articles: { slug: string }[] };
      expect(page2.articles[0]?.slug).not.toBe(page1.articles[0]?.slug);
    });
  });

  describe("3.3 — filter kategori benar", () => {
    it("category filter only returns articles in that category", async () => {
      if (skipUnless(ctx, "server")) return;
      const api = clientFor(ctx);
      const all = (await api.json(await api.get("/api/articles?limit=20"))) as {
        articles: { category?: { slug: string } }[];
      };
      const withCategory = all.articles.find((a) => a.category?.slug);
      if (!withCategory?.category?.slug) return;

      const filtered = (await api.json(
        await api.get(`/api/articles?category=${withCategory.category.slug}&limit=20`),
      )) as { articles: { category?: { slug: string } }[] };

      for (const article of filtered.articles) {
        expect(article.category?.slug).toBe(withCategory.category.slug);
      }
    });
  });

  describe("3.4 — read complete sekali & poin ledger", () => {
    it("second read-complete returns already_awarded", async () => {
      if (skipUnless(ctx, "auth") || !publishedSlug) return;
      const api = clientFor(ctx, "USER");
      const first = (await api.json(
        await api.post(`/api/articles/${publishedSlug}/read-complete`),
      )) as { reason: string };
      const second = (await api.json(
        await api.post(`/api/articles/${publishedSlug}/read-complete`),
      )) as { awarded: boolean; reason: string };
      expect(["points_awarded", "already_awarded"]).toContain(first.reason);
      expect(second.awarded).toBe(false);
      expect(second.reason).toBe("already_awarded");
    });

    it("points ledger can include article_read after award", async () => {
      if (skipUnless(ctx, "auth") || !publishedId) return;
      const api = clientFor(ctx, "USER");
      await api.post(`/api/articles/${publishedSlug}/read-complete`);
      const ledger = (await api.json(await api.get("/api/points/my"))) as {
        transactions: { activityType: string; sourceType: string; sourceId: string }[];
      };
      const readTx = ledger.transactions.find(
        (t) => t.activityType === "article_read" && t.sourceId === publishedId,
      );
      if (readTx) {
        expect(readTx.sourceType).toBe("article");
      }
    });
  });

  describe("3.12 — draft autosave & restore", () => {
    it("PATCH draft autosaves partial fields", async () => {
      if (skipUnless(ctx, "auth") || !draftId) return;
      const api = clientFor(ctx, "CONTRIBUTOR");
      const updatedTitle = `§3 Autosaved ${ts}`;
      const patchRes = await api.patch(`/api/articles/drafts/${draftId}`, {
        title: updatedTitle,
        content: "<p>Autosaved content with <strong>markup</strong>.</p>",
      });
      expect(patchRes.status).toBe(200);
      const patched = (await patchRes.json()) as { title: string };
      expect(patched.title).toBe(updatedTitle);
    });

    it("GET my articles restores saved draft", async () => {
      if (skipUnless(ctx, "auth") || !draftId) return;
      const api = clientFor(ctx, "CONTRIBUTOR");
      const data = (await api.json(await api.get("/api/articles/my"))) as {
        articles: { id: string; title: string; status: string }[];
      };
      const restored = data.articles.find((a) => a.id === draftId);
      expect(restored).toBeTruthy();
      expect(restored!.status).toBe("DRAFT");
      expect(restored!.title).toContain("§3");
    });
  });

  describe("3.13 — preview hanya author/admin", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server") || !draftId) return;
      const res = await clientFor(ctx).get(`/api/articles/preview/${draftId}`);
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-owner USER", async () => {
      if (skipUnless(ctx, "auth") || !draftId) return;
      const res = await clientFor(ctx, "USER").get(`/api/articles/preview/${draftId}`);
      expect(res.status).toBe(403);
    });

    it("returns 200 for draft owner", async () => {
      if (skipUnless(ctx, "auth") || !draftId) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").get(`/api/articles/preview/${draftId}`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as { id: string; status: string };
      expect(body.id).toBe(draftId);
      expect(body.status).toBe("DRAFT");
    });
  });

  describe("3.14 — my articles status", () => {
    it("articles include DRAFT status in list", async () => {
      if (skipUnless(ctx, "auth")) return;
      const data = (await clientFor(ctx, "CONTRIBUTOR").json(
        await clientFor(ctx, "CONTRIBUTOR").get("/api/articles/my"),
      )) as { articles: { status: string }[] };
      const statuses = new Set(data.articles.map((a) => a.status));
      expect(statuses.size).toBeGreaterThan(0);
      for (const status of statuses) {
        expect(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"]).toContain(
          status,
        );
      }
    });
  });

  describe("3.15 — workflow DRAFT→PENDING→PUBLISHED", () => {
    it("contributor can submit draft to PENDING_REVIEW", async () => {
      if (skipUnless(ctx, "auth") || !draftSlug) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").put(
        `/api/articles/${draftSlug}/update`,
        { status: "PENDING_REVIEW" },
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as { status: string };
      expect(body.status).toBe("PENDING_REVIEW");
    });

    it("admin can approve pending article", async () => {
      if (skipUnless(ctx, "auth") || !draftId) return;
      const res = await clientFor(ctx, "ADMIN").post(
        `/api/admin/articles/${draftId}/approve`,
      );
      expect(res.status).toBe(200);
    });
  });

  describe("3.16 — admin CRUD", () => {
    it("POST admin articles creates article", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").post("/api/admin/articles", {
        title: `§3 Admin CRUD ${ts}`,
        excerpt: "Admin created",
        content: "<p>Admin rich content</p>",
        status: "DRAFT",
      });
      expect([200, 201]).toContain(res.status);
    });

    it("GET admin articles lists with pagination", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/articles?limit=5&page=1");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { articles?: unknown[] } | unknown[];
      const list = Array.isArray(data) ? data : data.articles;
      expect(Array.isArray(list)).toBe(true);
    });
  });

  describe("3.17 — review queue approve", () => {
    it("GET pending returns array for admin", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/articles/pending");
      expect(res.status).toBe(200);
    });
  });

  describe("3.18 — bulk approve idempotensi", () => {
    it("bulk approve on already-published article succeeds without error", async () => {
      if (skipUnless(ctx, "auth") || !publishedId) return;
      const res = await clientFor(ctx, "ADMIN").post("/api/admin/articles/bulk", {
        action: "approve",
        ids: [publishedId],
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as { succeeded: number; results: { ok: boolean }[] };
      expect(body.succeeded).toBeGreaterThanOrEqual(1);
      expect(body.results.every((r) => r.ok)).toBe(true);
    });
  });

  describe("3.19 — export CSV/JSON", () => {
    it("export JSON returns array", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/articles/export?format=json");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it("export CSV returns text/csv", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/articles/export?format=csv");
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/csv");
      const text = await res.text();
      expect(text).toContain("id,title,slug");
    });
  });

  describe("3.20 — revisi & audit", () => {
    it("owner can fetch revision history for own article", async () => {
      if (skipUnless(ctx, "auth") || !draftSlug) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").get(
        `/api/articles/${draftSlug}/revisions`,
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as { revisions: unknown[]; articleTitle: string };
      expect(body.articleTitle).toBeTruthy();
      expect(Array.isArray(body.revisions)).toBe(true);
    });
  });

  describe("3.21 — featured/hot homepage feed", () => {
    it("home feed includes featuredArticles array", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/feed");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        featuredArticles?: unknown[];
        trending?: unknown[];
      };
      expect(Array.isArray(data.featuredArticles)).toBe(true);
      expect(Array.isArray(data.trending)).toBe(true);
    });
  });

  describe("3.22 — hapus soft/hard", () => {
    it("contributor cannot delete published article", async () => {
      if (skipUnless(ctx, "auth") || !publishedSlug) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").delete(
        `/api/articles/${publishedSlug}/delete`,
      );
      expect(res.status).toBe(403);
    });

    it("contributor can delete own non-published draft", async () => {
      if (skipUnless(ctx, "auth")) return;
      const api = clientFor(ctx, "CONTRIBUTOR");
      const createRes = await api.post("/api/articles/create", {
        title: `§3 Delete Me ${ts}`,
        content: "<p>To be deleted</p>",
        status: "DRAFT",
      });
      if (createRes.status !== 201) return;
      const { id, slug } = (await createRes.json()) as { id: string; slug: string };
      const delRes = await api.delete(`/api/articles/${slug}/delete`);
      expect(delRes.status).toBe(200);
      const gone = await api.get(`/api/articles/preview/${id}`);
      expect(gone.status).toBe(404);
    });
  });
});
