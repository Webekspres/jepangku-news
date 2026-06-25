import { describe, expect, test } from "bun:test";
import type { Video } from "@prisma/client";
import { isValidTargetType } from "@/lib/comments";
import { isValidReactionTargetType } from "@/lib/reactions";
import { serializePublicVideo } from "@/lib/video/serialize";
import { youtubeThumbnailUrl } from "@/lib/video/youtube";
import { parseVideoUrl } from "@/lib/video/platform";

function baseVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: "video-1",
    title: "Judul Video",
    slug: "judul-video",
    description: "Deskripsi singkat video.",
    content: "<p>Konten artikel video.</p>",
    // Data lama: youtubeId saja
    youtubeId: "g92DEa3uLio",
    videoUrl: null,
    platform: "YOUTUBE",
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

// ─── serializePublicVideo ─────────────────────────────────────────────────────

describe("serializePublicVideo — YouTube (data lama, hanya youtubeId)", () => {
  test("platform terdeteksi YOUTUBE dari youtubeId", () => {
    const result = serializePublicVideo(baseVideo());
    expect(result.platform).toBe("YOUTUBE");
  });

  test("embedUrl berisi youtube.com/embed", () => {
    const result = serializePublicVideo(baseVideo());
    expect(result.embedUrl).toContain("youtube.com/embed");
  });

  test("youtubeId terisi", () => {
    const result = serializePublicVideo(baseVideo());
    expect(result.youtubeId).toBe("g92DEa3uLio");
  });

  test("thumbnail otomatis dari YouTube jika tidak ada thumbnailUrl", () => {
    const result = serializePublicVideo(baseVideo({ thumbnailUrl: null }));
    expect(result.thumbnailUrl).toBe(youtubeThumbnailUrl("g92DEa3uLio"));
  });

  test("custom thumbnail dipertahankan", () => {
    const custom = "https://cdn.example.com/video-thumb.jpg";
    const result = serializePublicVideo(baseVideo({ thumbnailUrl: custom }));
    expect(result.thumbnailUrl).toBe(custom);
  });
});

describe("serializePublicVideo — YouTube (data baru, videoUrl)", () => {
  test("platform YOUTUBE dari videoUrl", () => {
    const result = serializePublicVideo(
      baseVideo({
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        youtubeId: null,
        platform: "YOUTUBE",
      }),
    );
    expect(result.platform).toBe("YOUTUBE");
    expect(result.youtubeId).toBe("dQw4w9WgXcQ");
  });

  test("thumbnailUrl otomatis dari YouTube ID yang terextract", () => {
    const result = serializePublicVideo(
      baseVideo({
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        youtubeId: null,
        thumbnailUrl: null,
        platform: "YOUTUBE",
      }),
    );
    expect(result.thumbnailUrl).toBe(youtubeThumbnailUrl("dQw4w9WgXcQ"));
  });
});

describe("serializePublicVideo — Facebook", () => {
  test("platform FACEBOOK terdeteksi", () => {
    const result = serializePublicVideo(
      baseVideo({
        videoUrl: "https://www.facebook.com/watch/?v=1234567890",
        youtubeId: null,
        platform: "FACEBOOK",
        thumbnailUrl: "https://example.com/thumb.jpg",
      }),
    );
    expect(result.platform).toBe("FACEBOOK");
    expect(result.youtubeId).toBeNull();
    expect(result.embedUrl).toContain("facebook.com/plugins/video.php");
  });
});

describe("serializePublicVideo — TikTok", () => {
  test("platform TIKTOK terdeteksi dengan embed URL", () => {
    const result = serializePublicVideo(
      baseVideo({
        videoUrl: "https://www.tiktok.com/@user/video/7234567890123456789",
        youtubeId: null,
        platform: "TIKTOK",
        thumbnailUrl: "https://example.com/thumb.jpg",
      }),
    );
    expect(result.platform).toBe("TIKTOK");
    expect(result.embedUrl).toContain("tiktok.com/embed");
  });
});

describe("serializePublicVideo — Instagram (link-out)", () => {
  test("platform INSTAGRAM, embedUrl null", () => {
    const result = serializePublicVideo(
      baseVideo({
        videoUrl: "https://www.instagram.com/reel/CxxxxYYYYY/",
        youtubeId: null,
        platform: "INSTAGRAM",
        thumbnailUrl: "https://example.com/thumb.jpg",
      }),
    );
    expect(result.platform).toBe("INSTAGRAM");
    expect(result.embedUrl).toBeNull();
  });
});

describe("serializePublicVideo — konten HTML", () => {
  test("sanitasi XSS dari content", () => {
    const result = serializePublicVideo(
      baseVideo({ content: "<p>Hello</p><script>alert(1)</script>" }),
    );
    expect(result.content).toContain("<p>Hello</p>");
    expect(result.content).not.toContain("<script>");
  });

  test("fallback ke description paragraph jika content kosong", () => {
    const result = serializePublicVideo(
      baseVideo({ content: null, description: "Ringkasan video" }),
    );
    expect(result.content).toBe("<p>Ringkasan video</p>");
  });
});

// ─── parseVideoUrl ────────────────────────────────────────────────────────────

describe("parseVideoUrl", () => {
  test("YouTube watch URL", () => {
    const r = parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(r?.platform).toBe("YOUTUBE");
    expect(r?.platformId).toBe("dQw4w9WgXcQ");
    expect(r?.supportsEmbed).toBe(true);
  });

  test("YouTube short URL", () => {
    const r = parseVideoUrl("https://youtu.be/dQw4w9WgXcQ");
    expect(r?.platform).toBe("YOUTUBE");
    expect(r?.platformId).toBe("dQw4w9WgXcQ");
  });

  test("YouTube Shorts URL", () => {
    const r = parseVideoUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ");
    expect(r?.platform).toBe("YOUTUBE");
    expect(r?.platformId).toBe("dQw4w9WgXcQ");
  });

  test("YouTube bare ID", () => {
    const r = parseVideoUrl("dQw4w9WgXcQ");
    expect(r?.platform).toBe("YOUTUBE");
    expect(r?.platformId).toBe("dQw4w9WgXcQ");
  });

  test("Facebook watch URL", () => {
    const r = parseVideoUrl("https://www.facebook.com/watch/?v=1234567890");
    expect(r?.platform).toBe("FACEBOOK");
    expect(r?.supportsEmbed).toBe(true);
    expect(r?.embedUrl).toContain("facebook.com/plugins/video.php");
  });

  test("Facebook page video URL", () => {
    const r = parseVideoUrl("https://www.facebook.com/JepangkuPage/videos/9876543210/");
    expect(r?.platform).toBe("FACEBOOK");
    expect(r?.platformId).toBe("9876543210");
  });

  test("TikTok video URL dengan ID", () => {
    const r = parseVideoUrl("https://www.tiktok.com/@jepangku/video/7234567890123456789");
    expect(r?.platform).toBe("TIKTOK");
    expect(r?.platformId).toBe("7234567890123456789");
    expect(r?.supportsEmbed).toBe(true);
    expect(r?.embedUrl).toContain("tiktok.com/embed");
  });

  test("TikTok short URL tanpa ID — link-out only", () => {
    const r = parseVideoUrl("https://vm.tiktok.com/ZMxxxxxx/");
    expect(r?.platform).toBe("TIKTOK");
    expect(r?.supportsEmbed).toBe(false);
    expect(r?.embedUrl).toBeNull();
  });

  test("Instagram reel — link-out only", () => {
    const r = parseVideoUrl("https://www.instagram.com/reel/CxxxxxYYYY/");
    expect(r?.platform).toBe("INSTAGRAM");
    expect(r?.supportsEmbed).toBe(false);
    expect(r?.embedUrl).toBeNull();
  });

  test("URL tidak dikenal — platform OTHER", () => {
    const r = parseVideoUrl("https://vimeo.com/123456789");
    expect(r?.platform).toBe("OTHER");
    expect(r?.supportsEmbed).toBe(false);
  });

  test("string kosong — null", () => {
    expect(parseVideoUrl("")).toBeNull();
  });

  test("string bukan URL dan bukan YouTube ID — null", () => {
    expect(parseVideoUrl("bukan-url")).toBeNull();
  });
});

// ─── comment / reaction target types ─────────────────────────────────────────

describe("video comment/reaction target types", () => {
  test("accepts VIDEO as comment target", () => {
    expect(isValidTargetType("VIDEO")).toBe(true);
  });

  test("accepts VIDEO as reaction target", () => {
    expect(isValidReactionTargetType("VIDEO")).toBe(true);
  });
});
