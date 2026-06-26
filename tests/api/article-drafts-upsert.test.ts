import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { parseApiResponse } from "@/lib/fetch-api";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

/**
 * Local-first autosave persistence.
 *
 * Drafts are saved locally while editing and only flushed to the DB on
 * leave/save. Every flush — debounced save, `sendBeacon` on reload/close, and
 * the explicit "Simpan Draft"/"Publikasikan" button — sends the *same*
 * client-generated `id`, so the create endpoints upsert by that id instead of
 * inserting a new row.
 *
 * These tests pin the two guarantees that make this safe for many users:
 *   1. Idempotency — repeated POSTs with the same id never create duplicates.
 *   2. Ownership — a client id owned by one user can never be hijacked/overwritten
 *      by another.
 */

type ArticleResponse = {
  id: string;
  slug: string;
  status: string;
  title: string;
  publishedAt: string | null;
};

const uid = () => crypto.randomUUID();
const nonce = () => Math.random().toString(36).slice(2, 8);

describe("API — article draft upsert (local-first autosave)", () => {
  let ctx: IntegrationContext;

  // Rows to remove after the suite so the test DB stays clean.
  const contributorSlugs: string[] = [];
  const adminSlugs: string[] = [];

  // Shared contributor-owned draft used by both idempotency and ownership checks.
  const contribId = uid();
  let contribCreated = false;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  afterAll(async () => {
    if (!ctx?.serverUp || !ctx.authAvailable) return;
    for (const slug of contributorSlugs) {
      await clientFor(ctx, "CONTRIBUTOR").delete(`/api/articles/${slug}/delete`);
    }
    for (const slug of adminSlugs) {
      await clientFor(ctx, "ADMIN").delete(`/api/articles/${slug}/delete`);
    }
  });

  // ───────────────────────────────────────────────────────────────────────
  // User portal endpoint (/api/articles/create) — contributor + cross-user
  // ───────────────────────────────────────────────────────────────────────
  describe("user portal (/api/articles/create)", () => {
    it("[1] creates a brand-new draft for a client-supplied id (201)", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").post("/api/articles/create", {
        id: contribId,
        title: `Autosave Draft ${nonce()}`,
        content: "<p>First local-first flush.</p>",
        status: "DRAFT",
      });
      expect(res.status).toBe(201);
      const article = (await parseApiResponse(res)) as ArticleResponse;
      expect(article.id).toBe(contribId);
      expect(article.status).toBe("DRAFT");
      contributorSlugs.push(article.slug);
      contribCreated = true;
    });

    it("[2] re-posting the same id updates in place (200) — no duplicate row", async () => {
      if (skipUnless(ctx, "auth") || !contribCreated) return;
      const updatedTitle = `Autosave Draft Edited ${nonce()}`;

      const res = await clientFor(ctx, "CONTRIBUTOR").post("/api/articles/create", {
        id: contribId,
        title: updatedTitle,
        content: "<p>Second flush after editing.</p>",
        status: "DRAFT",
      });
      // Existing row → update path returns 200, not 201.
      expect(res.status).toBe(200);
      const article = (await parseApiResponse(res)) as ArticleResponse;
      expect(article.id).toBe(contribId);
      expect(article.title).toBe(updatedTitle);
      contributorSlugs.push(article.slug);

      // Confirm exactly one row exists for this id.
      const listRes = await clientFor(ctx, "CONTRIBUTOR").get("/api/articles/my");
      expect(listRes.status).toBe(200);
      const mine = (await parseApiResponse(listRes)) as ArticleResponse[];
      const matches = mine.filter((a) => a.id === contribId);
      expect(matches.length).toBe(1);
    });

    it("[3] another user cannot hijack someone else's client id (403)", async () => {
      if (skipUnless(ctx, "auth") || !contribCreated) return;
      // ADMIN may use this endpoint, but the id is owned by the contributor.
      const res = await clientFor(ctx, "ADMIN").post("/api/articles/create", {
        id: contribId,
        title: "Hijack attempt via client id",
        content: "<p>Should be rejected.</p>",
        status: "DRAFT",
      });
      expect(res.status).toBe(403);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // Admin endpoint (/api/admin/articles) — full lifecycle + backward compat
  // ───────────────────────────────────────────────────────────────────────
  describe("admin endpoint (/api/admin/articles)", () => {
    const adminId = uid();
    let adminCreated = false;

    it("[4] creates a draft for a client-supplied id (201)", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").post("/api/admin/articles", {
        id: adminId,
        title: `Admin Autosave ${nonce()}`,
        content: "<p>Admin first flush.</p>",
        status: "DRAFT",
      });
      expect(res.status).toBe(201);
      const article = (await parseApiResponse(res)) as ArticleResponse;
      expect(article.id).toBe(adminId);
      expect(article.status).toBe("DRAFT");
      adminCreated = true;
    });

    it("[5] repeated flush with same id stays a single row (200)", async () => {
      if (skipUnless(ctx, "auth") || !adminCreated) return;
      const editedTitle = `Admin Autosave Edited ${nonce()}`;
      const res = await clientFor(ctx, "ADMIN").post("/api/admin/articles", {
        id: adminId,
        title: editedTitle,
        content: "<p>Admin second flush.</p>",
        status: "DRAFT",
      });
      // Existing row → update path returns 200, not a second 201.
      expect(res.status).toBe(200);

      // The row is the same PK record — fetch it back by id (admin drafts are
      // only listed for their author, so we read it directly).
      const byId = await clientFor(ctx, "ADMIN").get(`/api/admin/articles/${adminId}`);
      expect(byId.status).toBe(200);
      const article = (await parseApiResponse(byId)) as ArticleResponse;
      expect(article.id).toBe(adminId);
      expect(article.title).toBe(editedTitle);
      expect(article.status).toBe("DRAFT");
    });

    it("[6] publishing via the same id transitions in place and sets publishedAt", async () => {
      if (skipUnless(ctx, "auth") || !adminCreated) return;
      const res = await clientFor(ctx, "ADMIN").post("/api/admin/articles", {
        id: adminId,
        title: `Admin Autosave Published ${nonce()}`,
        content: "<p>Final published content.</p>",
        status: "PUBLISHED",
      });
      expect(res.status).toBe(200);
      const article = (await parseApiResponse(res)) as ArticleResponse;
      expect(article.id).toBe(adminId);
      expect(article.status).toBe("PUBLISHED");
      expect(article.publishedAt).toBeTruthy();
      adminSlugs.push(article.slug);
    });

    it("[7] omitting the id keeps the legacy behaviour — distinct rows each time", async () => {
      if (skipUnless(ctx, "auth")) return;
      const mk = () => ({
        title: `Admin No-Id ${nonce()}`,
        content: "<p>Legacy create path.</p>",
        status: "DRAFT",
      });

      const r1 = await clientFor(ctx, "ADMIN").post("/api/admin/articles", mk());
      const r2 = await clientFor(ctx, "ADMIN").post("/api/admin/articles", mk());
      expect(r1.status).toBe(201);
      expect(r2.status).toBe(201);
      const a1 = (await parseApiResponse(r1)) as ArticleResponse;
      const a2 = (await parseApiResponse(r2)) as ArticleResponse;
      expect(a1.id).not.toBe(a2.id);
      adminSlugs.push(a1.slug, a2.slug);
    });

    it("[8] admin endpoint also blocks editing a draft owned by another user (403)", async () => {
      if (skipUnless(ctx, "auth") || !contribCreated) return;
      const res = await clientFor(ctx, "ADMIN").post("/api/admin/articles", {
        id: contribId,
        title: "Cross-portal hijack attempt",
        content: "<p>Should be rejected.</p>",
        status: "DRAFT",
      });
      expect(res.status).toBe(403);
    });
  });
});
