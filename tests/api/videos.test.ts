import { beforeAll, describe, expect, it } from "bun:test";
import { fetchPublishedVideoSlug } from "../helpers/fixtures";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

const PUBLIC_VIDEO_FIELDS = [
  "id",
  "title",
  "slug",
  "description",
  "youtubeId",
  "thumbnailUrl",
  "publishedAt",
  "viewCount",
  "isFeatured",
] as const;

describe("API — videos", () => {
  let ctx: IntegrationContext;
  let videoSlug: string | null = null;

  beforeAll(async () => {
    ctx = await setupIntegration();
    if (!ctx.serverUp) return;
    videoSlug = await fetchPublishedVideoSlug(clientFor(ctx));
  });

  describe("listing", () => {
    it("GET /api/videos returns published videos", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/videos?limit=5");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { videos: unknown[]; total: number };
      expect(Array.isArray(data.videos)).toBe(true);
      expect(typeof data.total).toBe("number");
    });

    it("GET /api/videos returns video grid card fields", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/videos?limit=1");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        videos: Record<(typeof PUBLIC_VIDEO_FIELDS)[number], unknown>[];
      };
      const card = data.videos?.[0];
      if (!card) return;
      for (const field of PUBLIC_VIDEO_FIELDS) {
        expect(card).toHaveProperty(field);
      }
      expect(typeof card.slug).toBe("string");
      expect(typeof card.youtubeId).toBe("string");
      expect(typeof card.thumbnailUrl).toBe("string");
    });

    it("GET /api/videos supports pagination", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/videos?limit=1&page=1");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { page: number; limit: number };
      expect(data.page).toBe(1);
      expect(data.limit).toBe(1);
    });
  });

  describe("detail", () => {
    it("GET /api/videos/{slug} returns full public video data", async () => {
      if (skipUnless(ctx, "server") || !videoSlug) return;
      const res = await clientFor(ctx).get(`/api/videos/${videoSlug}`);
      expect(res.status).toBe(200);
      const video = (await res.json()) as Record<string, unknown>;
      expect(video.slug).toBe(videoSlug);
      for (const field of PUBLIC_VIDEO_FIELDS) {
        expect(video).toHaveProperty(field);
      }
      expect(typeof video.youtubeId).toBe("string");
      expect((video.youtubeId as string).length).toBeGreaterThan(0);
    });

    it("GET unknown video returns 404", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/videos/nonexistent-video-slug");
      expect(res.status).toBe(404);
    });
  });

  describe("home TV wave", () => {
    it("GET /api/home/tv returns featured and sidebar videos", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/home/tv");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        featuredVideo: { slug: string; youtubeId: string } | null;
        sidebarVideos: { slug: string }[];
      };
      expect(data).toHaveProperty("featuredVideo");
      expect(Array.isArray(data.sidebarVideos)).toBe(true);
      if (data.featuredVideo) {
        expect(typeof data.featuredVideo.slug).toBe("string");
        expect(typeof data.featuredVideo.youtubeId).toBe("string");
      }
    });
  });

  describe("admin CRUD", () => {
    it("POST /api/admin/videos creates, PATCH updates, DELETE removes draft", async () => {
      if (skipUnless(ctx, "auth")) return;
      const admin = clientFor(ctx, "ADMIN");
      const title = `Integration Video ${Date.now()}`;

      const createRes = await admin.post("/api/admin/videos", {
        title,
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        status: "DRAFT",
        description: "Test video",
      });
      expect(createRes.status).toBe(201);
      const { id } = (await createRes.json()) as { id: string };

      const detailRes = await admin.get(`/api/admin/videos/${id}`);
      expect(detailRes.status).toBe(200);
      const video = (await detailRes.json()) as {
        title: string;
        youtubeId: string;
        status: string;
      };
      expect(video.title).toBe(title);
      expect(video.youtubeId).toBe("dQw4w9WgXcQ");
      expect(video.status).toBe("DRAFT");

      const patchRes = await admin.patch(`/api/admin/videos/${id}`, {
        title: `${title} (edited)`,
      });
      expect(patchRes.status).toBe(200);

      const deleteRes = await admin.delete(`/api/admin/videos/${id}`);
      expect(deleteRes.status).toBe(200);

      const goneRes = await admin.get(`/api/admin/videos/${id}`);
      expect(goneRes.status).toBe(404);
    });
  });
});
