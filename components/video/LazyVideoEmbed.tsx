"use client";

import Image from "next/image";
import { Play, ExternalLink } from "lucide-react";
import { useState } from "react";
import { MotionHoverScale } from "@/components/ui/motion";
import { imageLoadingProps } from "@/lib/image-loading";
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
   * Dipakai homepage TV untuk Instagram / Facebook / TikTok / Other.
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
      className={`group relative aspect-video w-full overflow-hidden bg-jepang-navy text-left ${className}`}
      aria-label={`Tonton di ${PLATFORM_LABELS[platform]}: ${title}`}
      data-testid={`video-external-thumb-${platform.toLowerCase()}`}
    >
      <MotionHoverScale className="absolute inset-0">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
            {...imageLoadingProps(false)}
          />
        ) : (
          <div className="absolute inset-0 bg-jepang-navy" />
        )}
      </MotionHoverScale>
      <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
      <span className="absolute left-3 top-3">
        <PlatformBadge platform={platform} />
      </span>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-jepang-red text-white shadow-lg transition-transform group-hover:scale-110">
          <ExternalLink size={26} className="ml-0.5" />
        </span>
      </span>
      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
        <ExternalLink size={12} />
        Buka di {PLATFORM_LABELS[platform]}
      </span>
    </a>
  );
}

/**
 * Embed inline YouTube / Facebook / TikTok / Instagram.
 * Lazy: tampilkan thumbnail + tombol play dulu; iframe dimuat setelah user klik.
 * Platform tanpa embedUrl / forceExternal → thumbnail + buka URL asli di tab baru.
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
  const useExternal = forceExternal || !embedUrl;

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
          sandbox={
            platform === "TIKTOK" || platform === "INSTAGRAM"
              ? "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className={`group relative aspect-video w-full overflow-hidden bg-jepang-navy text-left ${className}`}
      aria-label={`Putar video: ${title}`}
      data-testid={`video-thumbnail-${platform.toLowerCase()}`}
    >
      <MotionHoverScale className="absolute inset-0">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
            {...imageLoadingProps(false)}
          />
        ) : (
          <div className="absolute inset-0 bg-jepang-navy" />
        )}
      </MotionHoverScale>
      <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
      <span className="absolute left-3 top-3">
        <PlatformBadge platform={platform} />
      </span>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-jepang-red text-white shadow-lg transition-transform group-hover:scale-110">
          <Play size={28} fill="currentColor" className="ml-1" />
        </span>
      </span>
    </button>
  );
}
