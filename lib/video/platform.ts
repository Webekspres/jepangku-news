/**
 * lib/video/platform.ts
 *
 * Multi-platform video support untuk Jepangku TV.
 * Platform yang didukung: YouTube, Facebook, TikTok, Instagram, Other (link-out).
 *
 * Strategi embed:
 *  - YouTube   → iframe embed (autoplay setelah klik)
 *  - Facebook  → Facebook Video Player iframe (fb.watch / facebook.com/watch)
 *  - TikTok    → iframe embed (tiktok.com/embed)
 *  - Instagram → link-out (Instagram tidak izinkan iframe embed tanpa SDK)
 *  - Other     → link-out ke URL asli
 */

export type VideoPlatform =
  | "YOUTUBE"
  | "FACEBOOK"
  | "TIKTOK"
  | "INSTAGRAM"
  | "OTHER";

export type ParsedVideo = {
  platform: VideoPlatform;
  /** ID unik platform (YouTube videoId, Facebook videoId, TikTok videoId) */
  platformId: string | null;
  /** URL embed langsung (jika platform mendukung iframe) */
  embedUrl: string | null;
  /** URL asli yang disimpan — digunakan untuk link-out */
  originalUrl: string;
  /** Apakah platform mendukung iframe inline embed */
  supportsEmbed: boolean;
};

// ─── YouTube ──────────────────────────────────────────────────────────────────

const YT_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const YT_URL_PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/,
];

export function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (YT_ID_RE.test(trimmed)) return trimmed;
  for (const re of YT_URL_PATTERNS) {
    const m = trimmed.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

export function youtubeEmbedUrl(id: string, autoplay = false): string {
  const params = autoplay ? "?autoplay=1&rel=0" : "?rel=0";
  return `https://www.youtube.com/embed/${id}${params}`;
}

export function youtubeThumbnailUrl(
  id: string,
  quality: "hqdefault" | "maxresdefault" | "mqdefault" = "hqdefault",
): string {
  return `https://img.youtube.com/vi/${id}/${quality}.jpg`;
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

// Contoh URL yang didukung:
//   https://www.facebook.com/watch/?v=1234567890
//   https://www.facebook.com/video/1234567890
//   https://fb.watch/abcdefg/
//   https://www.facebook.com/FacebookPage/videos/1234567890/
const FB_VIDEO_ID_RE =
  /facebook\.com\/(?:watch\/?\?(?:.*&)?v=|video\/|[^/]+\/videos\/)(\d+)/;

export function extractFacebookVideoId(url: string): string | null {
  const m = url.match(FB_VIDEO_ID_RE);
  return m?.[1] ?? null;
}

/**
 * Facebook oEmbed / embedded video player.
 * Menggunakan Facebook's official video embed (tidak butuh SDK JS).
 * Referensi: https://developers.facebook.com/docs/plugins/embedded-video-player
 */
export function facebookEmbedUrl(originalUrl: string): string {
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(originalUrl)}&show_text=false&width=560&t=0`;
}

// ─── TikTok ───────────────────────────────────────────────────────────────────

// Contoh URL yang didukung:
//   https://www.tiktok.com/@user/video/1234567890123456789
//   https://vm.tiktok.com/ZMxxxxxx/   ← short URL, tidak bisa extract ID
const TIKTOK_VIDEO_ID_RE = /tiktok\.com\/@[^/]+\/video\/(\d+)/;

export function extractTikTokVideoId(url: string): string | null {
  const m = url.match(TIKTOK_VIDEO_ID_RE);
  return m?.[1] ?? null;
}

export function tiktokEmbedUrl(videoId: string): string {
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

// ─── Instagram ────────────────────────────────────────────────────────────────

// Instagram tidak mendukung iframe embed tanpa SDK, jadi kita link-out.
const IG_URL_RE = /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/;

export function isInstagramVideoUrl(url: string): boolean {
  return IG_URL_RE.test(url);
}

// ─── Master parser ─────────────────────────────────────────────────────────────

/**
 * Deteksi platform dari URL dan kembalikan metadata embed.
 *
 * @param rawUrl URL mentah yang diinput admin (bisa juga YouTube ID saja)
 */
export function parseVideoUrl(rawUrl: string): ParsedVideo | null {
  const url = rawUrl.trim();
  if (!url) return null;

  // Validasi minimal http/https (kecuali YouTube bare ID)
  const ytId = extractYoutubeId(url);
  if (ytId) {
    return {
      platform: "YOUTUBE",
      platformId: ytId,
      embedUrl: youtubeEmbedUrl(ytId, true),
      originalUrl: url.startsWith("http")
        ? url
        : `https://www.youtube.com/watch?v=${ytId}`,
      supportsEmbed: true,
    };
  }

  if (!/^https?:\/\//i.test(url)) return null;

  // Facebook
  if (/facebook\.com|fb\.watch/i.test(url)) {
    const fbId = extractFacebookVideoId(url);
    return {
      platform: "FACEBOOK",
      platformId: fbId,
      embedUrl: facebookEmbedUrl(url),
      originalUrl: url,
      supportsEmbed: true,
    };
  }

  // TikTok
  if (/tiktok\.com/i.test(url)) {
    const ttId = extractTikTokVideoId(url);
    return {
      platform: "TIKTOK",
      platformId: ttId,
      // Short TikTok URL (vm.tiktok.com) tidak bisa di-embed tanpa ID
      embedUrl: ttId ? tiktokEmbedUrl(ttId) : null,
      originalUrl: url,
      supportsEmbed: Boolean(ttId),
    };
  }

  // Instagram — link-out only
  if (/instagram\.com/i.test(url)) {
    return {
      platform: "INSTAGRAM",
      platformId: null,
      embedUrl: null,
      originalUrl: url,
      supportsEmbed: false,
    };
  }

  // Generic / Other
  return {
    platform: "OTHER",
    platformId: null,
    embedUrl: null,
    originalUrl: url,
    supportsEmbed: false,
  };
}

/** Label display per platform */
export const PLATFORM_LABELS: Record<VideoPlatform, string> = {
  YOUTUBE: "YouTube",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  INSTAGRAM: "Instagram",
  OTHER: "Video Eksternal",
};

/** Ikon badge warna per platform (Tailwind classes) */
export const PLATFORM_BADGE_CLASSES: Record<VideoPlatform, string> = {
  YOUTUBE: "bg-red-100 text-red-700",
  FACEBOOK: "bg-blue-100 text-blue-700",
  TIKTOK: "bg-gray-900 text-white",
  INSTAGRAM: "bg-pink-100 text-pink-700",
  OTHER: "bg-gray-100 text-gray-600",
};
