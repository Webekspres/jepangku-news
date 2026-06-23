import { describe, expect, test } from "bun:test";
import type { Video } from "@prisma/client";
import { isValidTargetType } from "@/lib/comments";
import { isValidReactionTargetType } from "@/lib/reactions";
import { serializePublicVideo } from "@/lib/video/serialize";
import { youtubeThumbnailUrl } from "@/lib/video/youtube";

function baseVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: "video-1",
    title: "Judul Video",
    slug: "judul-video",
    description: "Deskripsi singkat video.",
    content: "<p>Konten artikel video.</p>",
    youtubeId: "g92DEa3uLio",
    thumbnailUrl: null,
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 10,
    publishedAt: new Date("2026-06-01T00:00:00.000Z"),
    createdBy: "admin-1",
    createdAt: new Date("2026-06-01T00:00:00.000Z"),
    updatedAt: new Date("2026-06-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("serializePublicVideo", () => {
  test("uses YouTube thumbnail when custom thumbnail is missing", () => {
    const result = serializePublicVideo(baseVideo({ thumbnailUrl: null }));
    expect(result.thumbnailUrl).toBe(youtubeThumbnailUrl("g92DEa3uLio"));
  });

  test("keeps custom thumbnail when provided", () => {
    const custom = "https://cdn.example.com/video-thumb.jpg";
    const result = serializePublicVideo(baseVideo({ thumbnailUrl: custom }));
    expect(result.thumbnailUrl).toBe(custom);
  });

  test("returns sanitized HTML content when present", () => {
    const result = serializePublicVideo(
      baseVideo({ content: "<p>Hello</p><script>alert(1)</script>" }),
    );
    expect(result.content).toContain("<p>Hello</p>");
    expect(result.content).not.toContain("<script>");
  });

  test("falls back to description paragraph when content is empty", () => {
    const result = serializePublicVideo(
      baseVideo({ content: null, description: "Ringkasan video" }),
    );
    expect(result.content).toBe("<p>Ringkasan video</p>");
  });
});

describe("video comment/reaction target types", () => {
  test("accepts VIDEO as comment target", () => {
    expect(isValidTargetType("VIDEO")).toBe(true);
  });

  test("accepts VIDEO as reaction target", () => {
    expect(isValidReactionTargetType("VIDEO")).toBe(true);
  });
});
