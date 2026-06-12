"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";
import { youtubeEmbedUrl } from "@/lib/video/youtube";

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
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className={`relative aspect-video w-full bg-black ${className}`}>
        <iframe
          src={youtubeEmbedUrl(youtubeId, true)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
          data-testid={`youtube-embed-${youtubeId}`}
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
      data-testid={`youtube-thumbnail-${youtubeId}`}
    >
      <Image
        src={thumbnailUrl}
        alt={title}
        fill
        sizes="(max-width: 1024px) 100vw, 66vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-jepang-red text-white shadow-lg transition-transform group-hover:scale-110">
          <Play size={28} fill="currentColor" className="ml-1" />
        </span>
      </span>
    </button>
  );
}
