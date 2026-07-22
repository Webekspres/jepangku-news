import { describe, expect, test } from "bun:test";
import type { Video } from "@prisma/client";
import { needsInstagramThumbnailBackfill } from "@/lib/video/fetch-external-thumbnail";

function baseVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: "video-ig-1",
    title: "Reel IG",
    slug: "reel-ig",
    description: null,
    content: null,
    youtubeId: null,
    videoUrl: "https://www.instagram.com/reel/DZNCEiRBcnQ/",
    platform: "INSTAGRAM",
    thumbnailUrl: null,
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 0,
    publishedAt: new Date("2026-06-01T00:00:00.000Z"),
    createdBy: "admin-1",
    createdAt: new Date("2026-06-01T00:00:00.000Z"),
    updatedAt: new Date("2026-06-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("needsInstagramThumbnailBackfill", () => {
  test("true jika Instagram tanpa thumbnail", () => {
    expect(needsInstagramThumbnailBackfill(baseVideo())).toBe(true);
  });

  test("true jika Instagram masih pakai thumbnail YouTube", () => {
    expect(
      needsInstagramThumbnailBackfill(
        baseVideo({
          thumbnailUrl:
            "https://img.youtube.com/vi/1o6FCdKbhBg/maxresdefault.jpg",
        }),
      ),
    ).toBe(true);
  });

  test("true jika masih hasil mirror lokal/R2 kita", () => {
    expect(
      needsInstagramThumbnailBackfill(
        baseVideo({
          thumbnailUrl:
            "/api/files/mock/portal-berita/video-thumbs/x.jpg",
        }),
      ),
    ).toBe(true);
  });

  test("false jika sudah URL CDN Instagram bawaan", () => {
    expect(
      needsInstagramThumbnailBackfill(
        baseVideo({
          thumbnailUrl:
            "https://scontent-cgk2-1.cdninstagram.com/v/t51.82787-15/x.jpg",
        }),
      ),
    ).toBe(false);
  });

  test("false untuk YouTube", () => {
    expect(
      needsInstagramThumbnailBackfill(
        baseVideo({
          platform: "YOUTUBE",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          youtubeId: "dQw4w9WgXcQ",
          thumbnailUrl: null,
        }),
      ),
    ).toBe(false);
  });
});
