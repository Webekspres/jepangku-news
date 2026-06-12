"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Tv } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import type { PublicVideoSummary } from "@/lib/home/types";

const PER_PAGE = 12;

function VideoCard({ video }: { video: PublicVideoSummary }) {
  return (
    <Link
      href={`/tv/${video.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-jepang-border bg-white transition-colors hover:border-jepang-navy/30 hover:shadow-sm"
      data-testid={`video-card-${video.slug}`}
    >
      <div className="relative aspect-video overflow-hidden bg-jepang-off-white">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-jepang-red text-white">
            <Play size={20} fill="currentColor" className="ml-0.5" />
          </span>
        </span>
        {video.isFeatured ? (
          <span className="absolute left-2 top-2 rounded bg-jepang-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Featured
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-heading text-base font-bold leading-snug tracking-tight line-clamp-2 group-hover:text-jepang-red transition-colors">
          {video.title}
        </h3>
        {video.description ? (
          <p className="line-clamp-2 text-sm text-jepang-muted">{video.description}</p>
        ) : null}
        {video.viewCount > 0 ? (
          <p className="mt-auto text-[10px] font-mono uppercase tracking-wider text-jepang-muted">
            {video.viewCount.toLocaleString("id-ID")} views
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export default function TvArchivePage() {
  const [videos, setVideos] = useState<PublicVideoSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadVideos(1, true);
  }, []);

  const loadVideos = async (pageNum: number, reset = false) => {
    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        limit: String(PER_PAGE),
        page: String(pageNum),
      });
      const data = await fetch(`/api/videos?${params}`).then((r) => r.json());
      const incoming: PublicVideoSummary[] = Array.isArray(data.videos) ? data.videos : [];

      if (reset) {
        setVideos(incoming);
      } else {
        setVideos((prev) => {
          const ids = new Set(prev.map((v) => v.id));
          return [...prev, ...incoming.filter((v) => !ids.has(v.id))];
        });
      }
      setTotal(Number(data.total || 0));
      setPage(pageNum);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const hasMore = videos.length < total;

  return (
    <div className="bg-white min-h-screen" data-testid="tv-archive-page">
      <SectionHeader
        label="テレビ / JEPANGKU TV"
        title="Jepangku TV"
        subtitle="Video budaya, lifestyle, dan cerita Jepang dari komunitas Jepangku."
      />

      <div className="px-4 mx-auto max-w-7xl py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <SkeletonBox className="aspect-video w-full rounded-lg" />
                <SkeletonBox className="h-5 w-3/4" />
                <SkeletonBox className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => loadVideos(page + 1)}
                  disabled={loadingMore}
                  data-testid="tv-load-more"
                >
                  {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-24 text-center" data-testid="no-videos">
            <Tv size={48} strokeWidth={1.5} className="mx-auto mb-4 text-jepang-muted" />
            <p className="mb-2 font-heading text-2xl font-bold">Belum ada video</p>
            <p className="text-jepang-muted">Segera kembali untuk konten video terbaru!</p>
          </div>
        )}
      </div>
    </div>
  );
}
