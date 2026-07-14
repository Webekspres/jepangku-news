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
 *  - Instagram → iframe embed (/p|/reel|/tv/{code}/embed) untuk konten publik
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

/**
 * Parse a URL with the WHATWG `URL` parser (linear) instead of regex to avoid
 * ReDoS. Tries the raw string first, then with an `https://` prefix so
 * protocol-less inputs like "youtu.be/ID" still work. Returns null when the
 * value cannot be parsed as a URL.
 */
function safeParseUrl(raw: string): URL | null {
  for (const candidate of [raw, `https://${raw}`]) {
    try {
      return new URL(candidate);
    } catch {
      // try the next candidate
    }
  }
  return null;
}

export function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (YT_ID_RE.test(trimmed)) return trimmed;

  const url = safeParseUrl(trimmed);
  if (!url) return null;

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  let candidate: string | null = null;

  if (host === "youtu.be") {
    candidate = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com"
  ) {
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] === "embed" || segments[0] === "shorts") {
      candidate = segments[1] ?? null;
    } else {
      candidate = url.searchParams.get("v");
    }
  }

  return candidate && YT_ID_RE.test(candidate) ? candidate : null;
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
const FB_HOSTS = new Set(["facebook.com", "m.facebook.com", "web.facebook.com"]);

export function extractFacebookVideoId(url: string): string | null {
  const parsed = safeParseUrl(url.trim());
  if (!parsed) return null;

  const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
  if (!FB_HOSTS.has(host)) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);

  // facebook.com/watch/?v=ID
  if (segments[0] === "watch") {
    const v = parsed.searchParams.get("v");
    return v && /^\d+$/.test(v) ? v : null;
  }
  // facebook.com/video/ID
  if (segments[0] === "video" && segments[1] && /^\d+$/.test(segments[1])) {
    return segments[1];
  }
  // facebook.com/{page}/videos/ID
  const idx = segments.indexOf("videos");
  const id = idx >= 0 ? segments[idx + 1] : undefined;
  if (id && /^\d+$/.test(id)) return id;

  return null;
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

// Contoh URL yang didukung:
//   https://www.instagram.com/p/CODE/
//   https://www.instagram.com/reel/CODE/
//   https://www.instagram.com/tv/CODE/
const IG_URL_RE = /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/i;

export function isInstagramVideoUrl(url: string): boolean {
  return IG_URL_RE.test(url);
}

export function extractInstagramShortcode(url: string): {
  kind: "p" | "reel" | "tv";
  code: string;
} | null {
  const match = url.match(IG_URL_RE);
  if (!match?.[1] || !match[2]) return null;
  return {
    kind: match[1].toLowerCase() as "p" | "reel" | "tv",
    code: match[2],
  };
}

/** Embed publik Instagram (hanya konten yang mengizinkan embed). */
export function instagramEmbedUrl(url: string): string | null {
  const parsed = extractInstagramShortcode(url);
  if (!parsed) return null;
  return `https://www.instagram.com/${parsed.kind}/${parsed.code}/embed/`;
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

  // Instagram — iframe /embed untuk post/reel/tv publik
  if (/instagram\.com/i.test(url)) {
    const ig = extractInstagramShortcode(url);
    const embedUrl = instagramEmbedUrl(url);
    return {
      platform: "INSTAGRAM",
      platformId: ig?.code ?? null,
      embedUrl,
      originalUrl: url,
      supportsEmbed: Boolean(embedUrl),
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
