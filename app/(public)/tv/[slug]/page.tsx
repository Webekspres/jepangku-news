"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { parseApiResponse } from "@/lib/fetch-api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LazyYoutubeEmbed from "@/components/video/LazyYoutubeEmbed";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import type { PublicVideoSummary } from "@/lib/home/types";

export default function TvDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [video, setVideo] = useState<PublicVideoSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/videos/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return parseApiResponse(r);
      })
      .then((data) => {
        setVideo(data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-12">
        <div className="px-4 mx-auto max-w-4xl space-y-6">
          <SkeletonBox className="h-4 w-32" />
          <SkeletonBox className="aspect-video w-full rounded-lg" />
          <SkeletonBox className="h-8 w-2/3" />
          <SkeletonBox className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="bg-white min-h-screen py-24 text-center">
        <p className="font-heading text-2xl font-bold mb-2">Video tidak ditemukan</p>
        <Link href="/tv" className="text-jepang-red hover:underline">
          Kembali ke Jepangku TV
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen" data-testid="tv-detail-page">
      <div className="px-4 mx-auto max-w-4xl py-8 md:py-12">
        <Link
          href="/tv"
          className="inline-flex items-center gap-2 text-xs font-semibold text-jepang-muted hover:text-jepang-red mb-6"
        >
          <ArrowLeft size={14} /> Semua Video
        </Link>

        <div className="overflow-hidden rounded-lg border border-jepang-border shadow-jepang">
          <LazyYoutubeEmbed
            youtubeId={video.youtubeId}
            title={video.title}
            thumbnailUrl={video.thumbnailUrl}
          />
        </div>

        <div className="mt-6">
          <h1 className="font-heading text-2xl md:text-3xl font-black tracking-tighter">
            {video.title}
          </h1>
          {video.description ? (
            <p className="mt-3 text-sm md:text-base text-jepang-muted leading-relaxed">
              {video.description}
            </p>
          ) : null}
          {video.viewCount > 0 ? (
            <p className="mt-4 text-xs font-mono uppercase tracking-wider text-jepang-muted">
              {video.viewCount.toLocaleString("id-ID")} views
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
