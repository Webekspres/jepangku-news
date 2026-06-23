import { beforeAll, describe, expect, it } from "bun:test";
import { parseApiResponse } from '@/lib/fetch-api';
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
      const data = (await parseApiResponse(res)) as {
        comments: { replies?: unknown[]; parentId?: string | null }[];
        total: number;
      };
      expect(Array.isArray(data.comments)).toBe(true);
      expect(typeof data.total).toBe("number");
      for (const root of data.comments) {
        expect(root.parentId ?? null).toBeNull();
        if (root.replies) expect(Array.isArray(root.replies)).toBe(true);
      }
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
      const data = (await parseApiResponse(res)) as { comment: { id: string; content: string } };
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
      const data = (await parseApiResponse(res)) as { comment: { parentId: string } };
      expect(data.comment.parentId).toBe(createdCommentId);
    });

    it("rejects reply to reply (thread limited to 1 level)", async () => {
      if (skipUnless(ctx, "auth") || !articleId || !createdCommentId) return;
      const api = clientFor(ctx, "CONTRIBUTOR");
      const replyRes = await api.post("/api/comments", {
        targetType: "ARTICLE",
        targetId: articleId,
        parentId: createdCommentId,
        content: `Nested reply test ${Date.now()}`,
      });
      if (replyRes.status !== 201) return;
      const { comment: reply } = (await api.json(replyRes)) as { comment: { id: string } };

      const nested = await api.post("/api/comments", {
        targetType: "ARTICLE",
        targetId: articleId,
        parentId: reply.id,
        content: "Should fail — third level",
      });
      expect(nested.status).toBe(400);
    });

    it("awards up to 2 points on comment create", async () => {
      if (skipUnless(ctx, "auth") || !articleId) return;
      const res = await clientFor(ctx, "CONTRIBUTOR").post("/api/comments", {
        targetType: "ARTICLE",
        targetId: articleId,
        content: `Points check ${Date.now()}`,
      });
      if (res.status !== 201) return;
      const data = (await parseApiResponse(res)) as { points: number; pointsAwarded: boolean };
      expect(typeof data.points).toBe("number");
      if (data.pointsAwarded) {
        expect(data.points).toBe(2);
      } else {
        expect(data.points).toBe(0);
      }
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
      const data = (await parseApiResponse(res)) as { isEdited: boolean };
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
      const contributor = clientFor(ctx, "CONTRIBUTOR");
      const { comment } = (await contributor.json(create)) as { comment: { id: string } };

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
      const contributor = clientFor(ctx, "CONTRIBUTOR");
      const { comment } = (await contributor.json(create)) as { comment: { id: string } };

      const res = await clientFor(ctx, "ADMIN").patch(`/api/admin/comments/${comment.id}`, {
        action: "hide",
      });
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as { status: string };
      expect(data.status).toBe("HIDDEN");

      const unhide = await clientFor(ctx, "ADMIN").patch(`/api/admin/comments/${comment.id}`, {
        action: "unhide",
      });
      expect(unhide.status).toBe(200);
      const admin = clientFor(ctx, "ADMIN");
      const shown = (await parseApiResponse(unhide)) as { status: string };
      expect(shown.status).toBe("VISIBLE");
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

  describe("reply notification", () => {
    it("reply notifies parent comment owner", async () => {
      if (skipUnless(ctx, "auth") || !articleId) return;
      const userApi = clientFor(ctx, "USER");
      const contributorApi = clientFor(ctx, "CONTRIBUTOR");

      const parentRes = await userApi.post("/api/comments", {
        targetType: "ARTICLE",
        targetId: articleId,
        content: `Parent for notif ${Date.now()}`,
      });
      if (parentRes.status !== 201) return;
      const { comment: parent } = (await userApi.json(parentRes)) as { comment: { id: string } };

      const replyRes = await contributorApi.post("/api/comments", {
        targetType: "ARTICLE",
        targetId: articleId,
        parentId: parent.id,
        content: "Reply triggering notification",
      });
      expect(replyRes.status).toBe(201);

      const notifRes = await userApi.get("/api/notifications?limit=30");
      expect(notifRes.status).toBe(200);
      const { items } = (await userApi.json(notifRes)) as {
        items: { type?: string; title?: string }[];
      };
      const hasReplyNotif = items.some(
        (n) =>
          n.type === "COMMENT_REPLY" ||
          (n.title?.toLowerCase().includes("balasan") ?? false),
      );
      expect(hasReplyNotif).toBe(true);
    });
  });
});
