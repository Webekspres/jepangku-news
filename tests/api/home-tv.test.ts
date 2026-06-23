import { beforeAll, describe, expect, it } from "bun:test";
import { parseApiResponse } from "@/lib/fetch-api";
import type { HomeTvResponse } from "@/lib/home/types";
import type { PublicVideo } from "@/lib/video/serialize";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

type VideosListResponse = {
  videos: PublicVideo[];
  total: number;
};

function isPublishedAtDesc(videos: { publishedAt: string | null }[]): boolean {
  for (let i = 1; i < videos.length; i++) {
    const prev = videos[i - 1]!.publishedAt;
    const curr = videos[i]!.publishedAt;
    if (!prev || !curr) continue;
    if (new Date(prev).getTime() < new Date(curr).getTime()) return false;
  }
  return true;
}

function newestSidebarFromCatalog(
  catalog: PublicVideo[],
  featuredId: string | undefined,
  limit = 7,
): PublicVideo[] {
  return catalog
    .filter((video) => video.id !== featuredId)
    .sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

describe("API — home tv", () => {
  let ctx: IntegrationContext;
  let publishedCatalog: PublicVideo[] = [];

  beforeAll(async () => {
    ctx = await setupIntegration();
    if (!ctx.serverUp) return;

    const res = await clientFor(ctx).get("/api/videos?limit=48&sort=newest");
    if (!res.ok) return;

    const data = await parseApiResponse<VideosListResponse>(res);
    publishedCatalog = data.videos;
  });

  describe("GET /api/home/tv", () => {
    it("returns featuredVideo and sidebarVideos in API envelope", async () => {
      if (skipUnless(ctx, "server")) return;

      const res = await clientFor(ctx).get("/api/home/tv");
      expect(res.status).toBe(200);

      const data = await parseApiResponse<HomeTvResponse>(res);
      expect(data).toHaveProperty("featuredVideo");
      expect(Array.isArray(data.sidebarVideos)).toBe(true);
    });

    it("selects featured video with the highest view count", async () => {
      if (skipUnless(ctx, "server") || publishedCatalog.length === 0) return;

      const res = await clientFor(ctx).get("/api/home/tv");
      const data = await parseApiResponse<HomeTvResponse>(res);

      expect(data.featuredVideo).not.toBeNull();

      const maxViews = Math.max(...publishedCatalog.map((video) => video.viewCount));
      expect(data.featuredVideo!.viewCount).toBe(maxViews);

      const topByViews = [...publishedCatalog].sort(
        (a, b) => b.viewCount - a.viewCount,
      )[0]!;
      expect(data.featuredVideo!.slug).toBe(topByViews.slug);
    });

    it("returns up to 7 newest sidebar videos excluding featured", async () => {
      if (skipUnless(ctx, "server") || publishedCatalog.length === 0) return;

      const res = await clientFor(ctx).get("/api/home/tv");
      const data = await parseApiResponse<HomeTvResponse>(res);

      expect(data.sidebarVideos.length).toBeLessThanOrEqual(7);

      if (data.featuredVideo) {
        const sidebarIds = data.sidebarVideos.map((video) => video.id);
        expect(sidebarIds).not.toContain(data.featuredVideo.id);
      }

      const expectedSidebar = newestSidebarFromCatalog(
        publishedCatalog,
        data.featuredVideo?.id,
      );

      expect(data.sidebarVideos.map((video) => video.slug)).toEqual(
        expectedSidebar.map((video) => video.slug),
      );
    });

    it("orders sidebar videos by publishedAt descending", async () => {
      if (skipUnless(ctx, "server")) return;

      const res = await clientFor(ctx).get("/api/home/tv");
      const data = await parseApiResponse<HomeTvResponse>(res);

      if (data.sidebarVideos.length < 2) return;
      expect(isPublishedAtDesc(data.sidebarVideos)).toBe(true);
    });

    it("serializes video fields required by homepage section", async () => {
      if (skipUnless(ctx, "server")) return;

      const res = await clientFor(ctx).get("/api/home/tv");
      const data = await parseApiResponse<HomeTvResponse>(res);

      if (!data.featuredVideo) return;

      expect(data.featuredVideo.slug).toBeTruthy();
      expect(data.featuredVideo.title).toBeTruthy();
      expect(data.featuredVideo.youtubeId).toMatch(/^[a-zA-Z0-9_-]{11}$/);
      expect(data.featuredVideo.thumbnailUrl).toContain("youtube.com/vi/");
      expect(typeof data.featuredVideo.viewCount).toBe("number");
    });

    it("returns cache headers for lazy homepage wave", async () => {
      if (skipUnless(ctx, "server")) return;

      const res = await clientFor(ctx).get("/api/home/tv");
      const cache = res.headers.get("cache-control") ?? "";
      expect(cache).toMatch(/s-maxage/);
      expect(cache).toMatch(/stale-while-revalidate/);
    });
  });
});
