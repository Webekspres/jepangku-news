"use client";

import { Play, ExternalLink } from "lucide-react";
import { useState } from "react";
import CardCoverImage from "@/components/CardCoverImage";
import { PLATFORM_LABELS } from "@/lib/video/platform";
import type { VideoPlatform } from "@/lib/video/platform";

type LazyVideoEmbedProps = {
  platform: VideoPlatform;
  /** URL embed iframe. Jika null, tampilkan tombol link-out. */
  embedUrl: string | null;
  /** URL asli video — untuk link-out */
  videoUrl: string;
  title: string;
  thumbnailUrl: string;
  className?: string;
  /**
   * Jika true, jangan embed iframe — thumbnail saja, klik buka `videoUrl` di tab baru.
   * Non-YouTube selalu external (IG/FB/TikTok embed tidak andal).
   */
  forceExternal?: boolean;
};

/** Allow list iframe sandbox attributes per platform */
const IFRAME_ALLOW: Record<VideoPlatform, string> = {
  YOUTUBE:
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
  FACEBOOK: "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share",
  TIKTOK: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
  INSTAGRAM:
    "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen",
  OTHER: "",
};

/** Warna teks badge platform */
const PLATFORM_BADGE: Record<VideoPlatform, string> = {
  YOUTUBE: "bg-red-100 text-red-700",
  FACEBOOK: "bg-blue-100 text-blue-700",
  TIKTOK: "bg-gray-900 text-white",
  INSTAGRAM: "bg-pink-100 text-pink-700",
  OTHER: "bg-gray-100 text-gray-600",
};

function PlatformBadge({ platform }: { platform: VideoPlatform }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${PLATFORM_BADGE[platform]}`}
    >
      {PLATFORM_LABELS[platform]}
    </span>
  );
}

/** Wrapper relatif penuh — jangan bungkus Image fill dengan framer-motion (bisa bergeser/hilang). */
function ThumbnailFrame({
  thumbnailUrl,
  title,
}: {
  thumbnailUrl: string;
  title: string;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-105">
        <CardCoverImage
          src={thumbnailUrl}
          alt={title}
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
      </div>
    </div>
  );
}

function ExternalThumbnail({
  platform,
  videoUrl,
  title,
  thumbnailUrl,
  className,
}: {
  platform: VideoPlatform;
  videoUrl: string;
  title: string;
  thumbnailUrl: string;
  className: string;
}) {
  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block aspect-video w-full overflow-hidden bg-jepang-navy text-left ${className}`}
      aria-label={`Tonton di ${PLATFORM_LABELS[platform]}: ${title}`}
      data-testid={`video-external-thumb-${platform.toLowerCase()}`}
    >
      <ThumbnailFrame thumbnailUrl={thumbnailUrl} title={title} />
      <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
      <span className="absolute left-3 top-3 z-10">
        <PlatformBadge platform={platform} />
      </span>
      <span className="absolute inset-0 z-10 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-jepang-red text-white shadow-lg transition-transform group-hover:scale-110">
          <ExternalLink size={26} className="ml-0.5" />
        </span>
      </span>
      <span className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
        <ExternalLink size={12} />
        Buka di {PLATFORM_LABELS[platform]}
      </span>
    </a>
  );
}

/**
 * YouTube: lazy thumbnail → iframe setelah klik.
 * Non-YouTube (IG/FB/TikTok/Other): thumbnail + buka URL platform di tab baru.
 */
export default function LazyVideoEmbed({
  platform,
  embedUrl,
  videoUrl,
  title,
  thumbnailUrl,
  className = "",
  forceExternal = false,
}: LazyVideoEmbedProps) {
  const [playing, setPlaying] = useState(false);
  // Non-YouTube: selalu buka platform di tab baru (jangan putar iframe di halaman).
  const useExternal =
    forceExternal || !embedUrl || platform !== "YOUTUBE";

  if (useExternal) {
    return (
      <ExternalThumbnail
        platform={platform}
        videoUrl={videoUrl}
        title={title}
        thumbnailUrl={thumbnailUrl}
        className={className}
      />
    );
  }

  if (playing) {
    // Hanya YouTube yang sampai sini (non-YouTube sudah return ExternalThumbnail).
    return (
      <div
        className={`relative aspect-video w-full bg-black ${className}`}
        data-testid={`video-embed-${platform.toLowerCase()}`}
      >
        <iframe
          src={embedUrl}
          title={title}
          allow={IFRAME_ALLOW[platform]}
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className={`group relative block aspect-video w-full overflow-hidden bg-jepang-navy text-left ${className}`}
      aria-label={`Putar video: ${title}`}
      data-testid={`video-thumbnail-${platform.toLowerCase()}`}
    >
      <ThumbnailFrame thumbnailUrl={thumbnailUrl} title={title} />
      <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
      <span className="absolute left-3 top-3 z-10">
        <PlatformBadge platform={platform} />
      </span>
      <span className="absolute inset-0 z-10 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-jepang-red text-white shadow-lg transition-transform group-hover:scale-110">
          <Play size={28} fill="currentColor" className="ml-1" />
        </span>
      </span>
    </button>
  );
}
