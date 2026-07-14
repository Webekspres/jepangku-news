import type { Video } from "@prisma/client";
import { sanitizeHtmlContent, sanitizePlainField } from "@/lib/sanitizer";
import {
  parseVideoUrl,
  youtubeThumbnailUrl,
  type VideoPlatform,
} from "@/lib/video/platform";

export type PublicVideo = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  /** Platform video: YOUTUBE | FACEBOOK | TIKTOK | INSTAGRAM | OTHER */
  platform: VideoPlatform;
  /** URL embed langsung (iframe). Null untuk Other / URL pendek TikTok. */
  embedUrl: string | null;
  /** URL asli video — digunakan untuk link-out jika embedUrl null */
  videoUrl: string;
  /** YouTube ID (hanya untuk video YouTube; null untuk platform lain) */
  youtubeId: string | null;
  thumbnailUrl: string;
  publishedAt: string | null;
  viewCount: number;
  isFeatured: boolean;
};

/**
 * Resolve embedUrl, platform, dan thumbnailUrl dari data DB.
 * Mendukung data lama (hanya youtubeId) dan data baru (videoUrl + platform).
 */
function resolveVideoMeta(video: Video): {
  platform: VideoPlatform;
  embedUrl: string | null;
  videoUrl: string;
  youtubeId: string | null;
  thumbnailUrl: string;
} {
  // Prioritaskan videoUrl baru; fall back ke youtubeId lama
  const rawUrl =
    video.videoUrl ??
    (video.youtubeId
      ? `https://www.youtube.com/watch?v=${video.youtubeId}`
      : null);

  if (!rawUrl) {
    return {
      platform: "OTHER",
      embedUrl: null,
      videoUrl: "",
      youtubeId: null,
      thumbnailUrl: video.thumbnailUrl ?? "",
    };
  }

  const parsed = parseVideoUrl(rawUrl);

  if (!parsed) {
    return {
      platform: "OTHER",
      embedUrl: null,
      videoUrl: rawUrl,
      youtubeId: null,
      thumbnailUrl: video.thumbnailUrl ?? "",
    };
  }

  const youtubeId =
    parsed.platform === "YOUTUBE" ? parsed.platformId : null;

  const thumbnailUrl =
    video.thumbnailUrl ??
    (youtubeId ? youtubeThumbnailUrl(youtubeId) : "");

  return {
    platform: parsed.platform,
    embedUrl: parsed.embedUrl,
    videoUrl: parsed.originalUrl,
    youtubeId,
    thumbnailUrl,
  };
}

export function serializePublicVideo(video: Video): PublicVideo {
  const content = video.content
    ? sanitizeHtmlContent(video.content)
    : video.description
      ? `<p>${sanitizePlainField(video.description, 2000)}</p>`
      : "";

  const meta = resolveVideoMeta(video);

  return {
    id: video.id,
    title: video.title,
    slug: video.slug,
    description: video.description,
    content,
    platform: meta.platform,
    embedUrl: meta.embedUrl,
    videoUrl: meta.videoUrl,
    youtubeId: meta.youtubeId,
    thumbnailUrl: meta.thumbnailUrl,
    publishedAt: video.publishedAt?.toISOString() ?? null,
    viewCount: video.viewCount,
    isFeatured: video.isFeatured,
  };
}

export const publishedVideoWhere = {
  status: "PUBLISHED" as const,
};
