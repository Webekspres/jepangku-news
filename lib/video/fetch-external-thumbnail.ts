import type { Video } from "@prisma/client";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import {
  isYoutubeHostedThumbnail,
  parseVideoUrl,
} from "@/lib/video/platform";

const log = logger.child({ module: "video.thumbnail" });

const IG_FETCH_HEADERS = {
  "User-Agent": "facebookexternalhit/1.1",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
} as const;

/** Single-pass entity decode — avoids chained &amp; → & re-unescape (CodeQL). */
function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(?:amp|quot|#x[0-9a-f]+|#\d+);/gi,
    (entity) => {
      const lower = entity.toLowerCase();
      if (lower === "&amp;") return "&";
      if (lower === "&quot;") return '"';
      if (/^&#x/i.test(entity)) {
        const code = Number.parseInt(entity.slice(3, -1), 16);
        return Number.isFinite(code) ? String.fromCharCode(code) : entity;
      }
      const code = Number(entity.slice(2, -1));
      return Number.isFinite(code) ? String.fromCharCode(code) : entity;
    },
  );
}

/** Ambil URL og:image bawaan Instagram (CDN), tanpa mirror/upload. */
export async function fetchInstagramOgImageUrl(
  videoUrl: string,
): Promise<string | null> {
  try {
    const res = await fetch(videoUrl, {
      headers: IG_FETCH_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return null;

    const html = await res.text();
    const match =
      html.match(
        /property=["']og:image["']\s+content=["']([^"']+)["']/i,
      ) ??
      html.match(
        /content=["']([^"']+)["']\s+property=["']og:image["']/i,
      );

    const raw = match?.[1]?.trim();
    if (!raw) return null;

    const decoded = decodeHtmlEntities(raw);
    const parsed = new URL(decoded);
    if (parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch (error) {
    log.warn("instagram.og_image.failed", {
      videoUrl,
      errorMessage: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

/** Thumbnail hasil mirror lokal/R2 kita — diganti ke og:image bawaan IG. */
function isMirroredVideoThumb(url: string): boolean {
  return (
    url.includes("/api/files/mock/") ||
    url.includes("/portal-berita/video-thumbs/") ||
    url.includes("video-thumbs/")
  );
}

/** Video Instagram tanpa thumbnail bawaan (kosong / YouTube stale / mirror kita). */
export function needsInstagramThumbnailBackfill(video: Video): boolean {
  const rawUrl =
    video.videoUrl ??
    (video.youtubeId
      ? `https://www.youtube.com/watch?v=${video.youtubeId}`
      : null);
  if (!rawUrl) return false;

  const parsed = parseVideoUrl(rawUrl);
  if (!parsed || parsed.platform !== "INSTAGRAM") return false;

  const thumb = video.thumbnailUrl?.trim() ?? "";
  if (!thumb) return true;
  if (isYoutubeHostedThumbnail(thumb)) return true;
  if (isMirroredVideoThumb(thumb)) return true;

  return false;
}

/**
 * Simpan URL thumbnail bawaan Instagram (og:image CDN) ke DB.
 * Tidak download/upload ke R2.
 */
export async function ensureInstagramThumbnail(
  video: Video,
): Promise<Video> {
  if (!needsInstagramThumbnailBackfill(video)) return video;

  const videoUrl = video.videoUrl;
  if (!videoUrl) return video;

  const ogUrl = await fetchInstagramOgImageUrl(videoUrl);
  if (!ogUrl) return video;

  try {
    return await db.video.update({
      where: { id: video.id },
      data: { thumbnailUrl: ogUrl },
    });
  } catch (error) {
    log.warn("instagram.thumbnail.persist_failed", {
      videoId: video.id,
      errorMessage: error instanceof Error ? error.message : "unknown",
    });
    return { ...video, thumbnailUrl: ogUrl };
  }
}
