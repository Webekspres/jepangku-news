import { beforeAll, describe, expect, it } from "bun:test";
import { fetchPublishedArticle } from "../helpers/fixtures";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

describe("API — comments", () => {
  let ctx: IntegrationContext;
  let articleId: string | null = null;
  let createdCommentId: string | null = null;

  beforeAll(async () => {
    ctx = await setupIntegration();
    if (!ctx.serverUp) return;
    const article = await fetchPublishedArticle(clientFor(ctx));
    articleId = article?.id ?? null;
  });

  describe("GET /api/comments", () => {
    it("returns 400 for missing target params", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/comments");
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid targetType", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/comments?targetType=INVALID&targetId=x");
      expect(res.status).toBe(400);
    });

    it("returns thread for published article", async () => {
      if (skipUnless(ctx, "server") || !articleId) return;
      const res = await clientFor(ctx).get(
        `/api/comments?targetType=ARTICLE&targetId=${articleId}`,
      );
      expect(res.status).toBe(200);
      const data = (await res.json()) as { comments: unknown[]; total: number };
      expect(Array.isArray(data.comments)).toBe(true);
      expect(typeof data.total).toBe("number");
    });
  });

  describe("POST /api/comments", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server") || !articleId) return;
      const res = await clientFor(ctx).post("/api/comments", {
        targetType: "ARTICLE",
        targetId: articleId,
        content: "Guest comment attempt",
      });
      expect(res.status).toBe(401);
    });

    it("creates top-level comment for USER", async () => {
      if (skipUnless(ctx, "auth") || !articleId) return;
      const res = await clientFor(ctx, "USER").post("/api/comments", {
        targetType: "ARTICLE",
        targetId: articleId,
        content: `Integration comment ${Date.now()}`,
      });
      expect(res.status).toBe(201);
      const data = (await res.json()) as { comment: { id: string; content: string } };
      expect(data.comment.id).toBeTruthy();
      createdCommentId = data.comment.id;
    });

    it("rejects empty content", async () => {
      if (skipUnless(ctx, "auth") || !articleId) return;
      const res = await clientFor(ctx, "USER").post("/api/comments", {
        targetType: "ARTICLE",
        targetId: articleId,
        content: "   ",
      });
      expect(res.status).toBe(400);
    });

    it("returns 404 for unknown target", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/comments", {
        targetType: "ARTICLE",
        targetId: "00000000-0000-0000-0000-000000000099",
        content: "Comment on missing article",
      });
      expect(res.status).toBe(404);
    });

    it("creates reply when parent is valid", async () => {
      if (skipUnless(ctx, "auth") || !articleId || !createdCommentId) return;
      const res = await clientFor(ctx, "USER").post("/api/comments", {
        targetType: "ARTICLE",
        targetId: articleId,
        parentId: createdCommentId,
        content: "Reply from integration test",
      });
      expect(res.status).toBe(201);
      const data = (await res.json()) as { comment: { parentId: string } };
      expect(data.comment.parentId).toBe(createdCommentId);
    });
  });

  describe("PATCH /api/comments/[id] — owner", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server") || !createdCommentId) return;
      const res = await clientFor(ctx).patch(`/api/comments/${createdCommentId}`, {
        content: "Edited",
      });
      expect(res.status).toBe(401);
    });

    it("allows owner to edit comment", async () => {
      if (skipUnless(ctx, "auth") || !createdCommentId) return;
      const res = await clientFor(ctx, "USER").patch(`/api/comments/${createdCommentId}`, {
        content: "Edited by owner",
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as { isEdited: boolean };
      expect(data.isEdited).toBe(true);
    });

    it("returns 403 for non-owner edit", async () => {
      if (skipUnless(ctx, "auth") || !createdCommentId) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").patch(`/api/comments/${createdCommentId}`, {
        content: "Hijack edit",
      });
      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/comments/[id]", () => {
    it("returns 401 for guest delete", async () => {
      if (skipUnless(ctx, "auth") || !createdCommentId) return;
      const res = await clientFor(ctx).delete(`/api/comments/${createdCommentId}`);
      expect(res.status).toBe(401);
    });

    it("owner can soft-delete own comment", async () => {
      if (skipUnless(ctx, "auth") || !createdCommentId) return;
      const res = await clientFor(ctx, "USER").delete(`/api/comments/${createdCommentId}`);
      expect(res.status).toBe(200);
    });
  });

  describe("admin moderation", () => {
    it("PATCH /api/admin/comments/[id] returns 403 for USER", async () => {
      if (skipUnless(ctx, "auth") || !articleId) return;
      const create = await clientFor(ctx, "CONTRIBUTOR").post("/api/comments", {
        targetType: "ARTICLE",
        targetId: articleId,
        content: "Comment for moderation test",
      });
      if (create.status !== 201) return;
      const { comment } = (await create.json()) as { comment: { id: string } };

      const res = await clientFor(ctx, "USER").patch(`/api/admin/comments/${comment.id}`, {
        action: "hide",
      });
      expect(res.status).toBe(403);
    });

    it("PATCH /api/admin/comments/[id] hide works for ADMIN", async () => {
      if (skipUnless(ctx, "auth") || !articleId) return;
      const create = await clientFor(ctx, "CONTRIBUTOR").post("/api/comments", {
        targetType: "ARTICLE",
        targetId: articleId,
        content: "Comment for admin hide",
      });
      if (create.status !== 201) return;
      const { comment } = (await create.json()) as { comment: { id: string } };

      const res = await clientFor(ctx, "ADMIN").patch(`/api/admin/comments/${comment.id}`, {
        action: "hide",
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as { status: string };
      expect(data.status).toBe("HIDDEN");
    });

    it("PATCH admin moderation rejects invalid action", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").patch(
        "/api/admin/comments/00000000-0000-0000-0000-000000000099",
        { action: "invalid" },
      );
      expect(res.status).toBe(400);
    });
  });
});
