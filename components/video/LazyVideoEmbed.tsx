"use client";

import Image from "next/image";
import Link from "next/link";
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
};

/** Allow list iframe sandbox attributes per platform */
const IFRAME_ALLOW: Record<VideoPlatform, string> = {
  YOUTUBE:
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
  FACEBOOK: "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share",
  TIKTOK: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
  INSTAGRAM: "",
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

/**
 * Embed inline YouTube / Facebook / TikTok.
 * Lazy: tampilkan thumbnail + tombol play dulu; iframe dimuat setelah user klik.
 */
export default function LazyVideoEmbed({
  platform,
  embedUrl,
  videoUrl,
  title,
  thumbnailUrl,
  className = "",
}: LazyVideoEmbedProps) {
  const [playing, setPlaying] = useState(false);

  // ── Platform yang tidak mendukung embed → link-out card ──────────────────
  if (!embedUrl) {
    return (
      <div
        className={`relative aspect-video w-full overflow-hidden bg-jepang-navy ${className}`}
        data-testid={`video-linkout-${platform.toLowerCase()}`}
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover opacity-60"
            {...imageLoadingProps(false)}
          />
        ) : (
          <div className="absolute inset-0 bg-jepang-navy" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-white">
          <PlatformBadge platform={platform} />
          <p className="text-center text-sm font-semibold text-white/90 line-clamp-2">{title}</p>
          <Link
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-jepang-navy shadow-lg transition-transform hover:scale-105"
            data-testid={`video-external-link-${platform.toLowerCase()}`}
          >
            <ExternalLink size={16} />
            Tonton di {PLATFORM_LABELS[platform]}
          </Link>
        </div>
      </div>
    );
  }

  // ── Platform dengan embed iframe ─────────────────────────────────────────
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
          // TikTok embed butuh sandbox lebih permisif
          sandbox={
            platform === "TIKTOK"
              ? "allow-scripts allow-same-origin allow-popups allow-presentation"
              : undefined
          }
        />
      </div>
    );
  }

  // ── Thumbnail + tombol play (lazy) ────────────────────────────────────────
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
      {/* Badge platform di sudut kiri atas */}
      <span className="absolute left-3 top-3">
        <PlatformBadge platform={platform} />
      </span>
      {/* Tombol play */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-jepang-red text-white shadow-lg transition-transform group-hover:scale-110">
          <Play size={28} fill="currentColor" className="ml-1" />
        </span>
      </span>
    </button>
  );
}
