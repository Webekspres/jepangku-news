"use client";

/**
 * LazyYoutubeEmbed — wrapper backward-compatible ke LazyVideoEmbed.
 * Dipertahankan agar halaman yang sudah ada tidak perlu diubah sekarang.
 * Gunakan LazyVideoEmbed untuk konten baru.
 */
import LazyVideoEmbed from "@/components/video/LazyVideoEmbed";
import { youtubeEmbedUrl } from "@/lib/video/platform";

type LazyYoutubeEmbedProps = {
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
  className?: string;
};

export default function LazyYoutubeEmbed({
  youtubeId,
  title,
  thumbnailUrl,
  className = "",
}: LazyYoutubeEmbedProps) {
  return (
    <LazyVideoEmbed
      platform="YOUTUBE"
      embedUrl={youtubeEmbedUrl(youtubeId, true)}
      videoUrl={`https://www.youtube.com/watch?v=${youtubeId}`}
      title={title}
      thumbnailUrl={thumbnailUrl}
      className={className}
    />
  );
}
