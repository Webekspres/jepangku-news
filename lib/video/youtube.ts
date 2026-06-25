/**
 * lib/video/youtube.ts
 *
 * Re-export fungsi YouTube dari platform.ts untuk backward-compatibility.
 * Gunakan lib/video/platform.ts untuk logika multi-platform.
 */
export {
  extractYoutubeId,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
} from "@/lib/video/platform";
