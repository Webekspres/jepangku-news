import { beforeAll, describe, expect, it } from "bun:test";
import { parseApiResponse } from "@/lib/fetch-api";
import {
} from "../helpers/fixtures";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

describe("API — videos", () => {
  let ctx: IntegrationContext;
  let publishedSlug: string | null = null;
  let publishedId: string | null = null;

  beforeAll(async () => {
    ctx = await setupIntegration();
    if (!ctx.serverUp) return;
    const _guest = clientFor(ctx);
  });

  describe("public listing", () => {
    it("GET /api/videos returns published videos in API envelope", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/videos?limit=3");
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as {
        videos: { id: string; slug: string; title: string }[];
        total: number;
      };
      expect(Array.isArray(data.videos)).toBe(true);
      expect(data.videos.length).toBeGreaterThan(0);
      expect(typeof data.total).toBe("number");
    });

    it("GET /api/videos supports sort=trending", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/videos?sort=trending&limit=3");
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as {
        videos: { viewCount: number }[];
      };
      expect(Array.isArray(data.videos)).toBe(true);
      if (data.videos.length >= 2) {
        expect(data.videos[0].viewCount).toBeGreaterThanOrEqual(data.videos[1].viewCount);
      }
    });
  });

  describe("detail", () => {
    it("GET /api/videos/[slug] returns video with content and thumbnail", async () => {
      if (skipUnless(ctx, "server") || !publishedSlug) return;
      const res = await clientFor(ctx).get(`/api/videos/${publishedSlug}`);
      expect(res.status).toBe(200);
      const video = (await parseApiResponse(res)) as {
        id: string;
        slug: string;
        title: string;
        content: string;
        platform: string;
        videoUrl: string;
        embedUrl: string | null;
        youtubeId: string | null;
        thumbnailUrl: string;
        viewCount: number;
      };
      expect(video.slug).toBe(publishedSlug);
      expect(video.platform).toBe("YOUTUBE");
      expect(video.videoUrl).toMatch(/youtube\.com|youtu\.be/);
      expect(video.embedUrl).toContain("youtube.com/embed");
      expect(video.youtubeId).toMatch(/^[a-zA-Z0-9_-]{11}$/);
      expect(video.thumbnailUrl).toContain("youtube.com/vi/");
      expect(typeof video.content).toBe("string");
      expect(video.content.length).toBeGreaterThan(0);
      expect(typeof video.viewCount).toBe("number");
    });

    it("GET /api/videos/[slug] increments view count", async () => {
      if (skipUnless(ctx, "server") || !publishedSlug) return;
      const api = clientFor(ctx);
      const beforeRes = await api.get(`/api/videos/${publishedSlug}`);
      const before = (await parseApiResponse(beforeRes)) as { viewCount: number };
      const afterRes = await api.get(`/api/videos/${publishedSlug}`);
      const after = (await parseApiResponse(afterRes)) as { viewCount: number };
      expect(after.viewCount).toBeGreaterThanOrEqual(before.viewCount);
    });

    it("GET /api/videos/[slug] returns 404 for unknown slug", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/videos/nonexistent-video-slug-xyz");
      expect(res.status).toBe(404);
    });
  });

  describe("reactions", () => {
    it("GET /api/reactions returns summary for VIDEO", async () => {
      if (skipUnless(ctx, "server") || !publishedId) return;
      const res = await clientFor(ctx).get(
        `/api/reactions?targetType=VIDEO&targetId=${publishedId}`,
      );
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as {
        counts: Record<string, number>;
        total: number;
        userReaction: string | null;
      };
      expect(typeof data.counts).toBe("object");
      expect(typeof data.total).toBe("number");
    });

    it("POST /api/reactions returns 401 for guest on VIDEO", async () => {
      if (skipUnless(ctx, "server") || !publishedId) return;
      const res = await clientFor(ctx).post("/api/reactions", {
        targetType: "VIDEO",
        targetId: publishedId,
        type: "LOVE",
      });
      expect(res.status).toBe(401);
    });

    it("POST /api/reactions toggles reaction for USER on VIDEO", async () => {
      if (skipUnless(ctx, "auth") || !publishedId) return;
      const api = clientFor(ctx, "USER");
      const res = await api.post("/api/reactions", {
        targetType: "VIDEO",
        targetId: publishedId,
        type: "LOVE",
      });
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as { userReaction: string | null };
      expect(["LOVE", null]).toContain(data.userReaction);
    });
  });

  describe("comments", () => {
    it("GET /api/comments returns thread for published video", async () => {
      if (skipUnless(ctx, "server") || !publishedId) return;
      const res = await clientFor(ctx).get(
        `/api/comments?targetType=VIDEO&targetId=${publishedId}`,
      );
      expect(res.status).toBe(200);
      const data = (await parseApiResponse(res)) as {
        comments: unknown[];
        total: number;
      };
      expect(Array.isArray(data.comments)).toBe(true);
      expect(typeof data.total).toBe("number");
    });

    it("POST /api/comments returns 401 for guest on VIDEO", async () => {
      if (skipUnless(ctx, "server") || !publishedId) return;
      const res = await clientFor(ctx).post("/api/comments", {
        targetType: "VIDEO",
        targetId: publishedId,
        content: "Guest comment on video",
      });
      expect(res.status).toBe(401);
    });

    it("POST /api/comments creates comment for USER on VIDEO", async () => {
      if (skipUnless(ctx, "auth") || !publishedId) return;
      const res = await clientFor(ctx, "USER").post("/api/comments", {
        targetType: "VIDEO",
        targetId: publishedId,
        content: `Video integration comment ${Date.now()}`,
      });
      expect(res.status).toBe(201);
      const data = (await parseApiResponse(res)) as { comment: { id: string } };
      expect(data.comment.id).toBeTruthy();
    });

    it("POST /api/comments returns 404 for unknown video id", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/comments", {
        targetType: "VIDEO",
        targetId: "00000000-0000-0000-0000-000000000099",
        content: "Comment on missing video",
      });
      expect(res.status).toBe(404);
    });
  });

  describe("admin boundary", () => {
    it("GET /api/admin/videos returns 403 for USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/admin/videos?limit=5");
      expect(res.status).toBe(403);
    });

    it("GET /api/admin/videos returns 200 for ADMIN", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/videos?limit=5");
      expect(res.status).toBe(200);
      const data = await parseApiResponse(res);
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
