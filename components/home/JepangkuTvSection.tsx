"use client";

import Link from "next/link";
import { ArrowRight, Play, Tv } from "lucide-react";
import CardCoverImage from "@/components/CardCoverImage";
import LazySectionSkeleton from "@/components/home/LazySectionSkeleton";
import LazyVideoEmbed from "@/components/video/LazyVideoEmbed";
import type { HomeTvResponse, PublicVideoSummary } from "@/lib/home/types";
import type { VideoPlatform } from "@/lib/video/platform";
type JepangkuTvSectionProps = {
  data: HomeTvResponse | null;
  loading: boolean;
  error: Error | null;
};

function TvSkeleton() {
  return (
    <LazySectionSkeleton minHeight={520} data-testid="tv-loading">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 overflow-hidden rounded-lg border border-jepang-border animate-pulse">
        <div className="aspect-video bg-jepang-border" />
        <div className="bg-jepang-red p-4 space-y-3">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-16 w-24 bg-white/10 rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </LazySectionSkeleton>
  );
}

function SidebarItem({ video }: { video: PublicVideoSummary }) {
  return (
    <Link
      href={`/tv/${video.slug}`}
      className="flex w-full gap-3 p-3 text-left transition-colors border-b border-white/10 last:border-b-0 hover:bg-white/5"
      data-testid={`tv-sidebar-${video.slug}`}
    >
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-sm bg-black/30">
        <CardCoverImage
          src={video.thumbnailUrl}
          alt={video.title}
          sizes="96px"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play size={14} fill="white" className="text-white" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">
          {video.title}
        </p>
        {video.viewCount > 0 ? (
          <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-white/70">
            {video.viewCount.toLocaleString("id-ID")} views
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export default function JepangkuTvSection({
  data,
  loading,
  error,
}: JepangkuTvSectionProps) {
  if (error) {
    return (
      <section className="py-12">
        <div className="px-4 mx-auto max-w-7xl">
          <p className="text-center text-sm text-jepang-muted py-8">
            Gagal memuat Jepangku TV.
          </p>
        </div>
      </section>
    );
  }

  if (loading || !data) {
    return (
      <section className="py-12">
        <div className="px-4 mx-auto max-w-7xl">
          <TvSkeleton />
        </div>
      </section>
    );
  }

  const sidebarVideos = data.sidebarVideos;
  const hasVideos = Boolean(data.featuredVideo) || sidebarVideos.length > 0;

  if (!hasVideos) {
    return (
      <section className="py-12 bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8 pb-3 border-b-2 border-jepang-red">
            <div>
              <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter flex items-center gap-3">
                <Tv size={32} strokeWidth={1.5} className="text-jepang-red" />
                <span className="section-title-gradient">Jepangku TV</span>
              </h2>
            </div>
          </div>
          <p className="text-center text-jepang-muted py-12">
            Belum ada video. Segera kembali!
          </p>
        </div>
      </section>
    );
  }

  const featuredVideo = data.featuredVideo!;
  const featuredPlatform = (featuredVideo.platform ?? "YOUTUBE") as VideoPlatform;

  return (
    <section className="py-12 bg-jepang-off-white" data-testid="jepangku-tv-section">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8 pb-3 border-b-2 border-jepang-red">
          <div>
            <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter flex items-center gap-3">
              <Tv size={32} strokeWidth={1.5} className="text-jepang-red" />
              <span className="section-title-gradient">Jepangku TV</span>
            </h2>
          </div>
          <Link
            href="/tv"
            className="hidden md:inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider hover:text-jepang-red transition-colors"
            data-testid="tv-view-all"
          >
            SEMUA VIDEO <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-jepang-border bg-white shadow-jepang">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0">
              <LazyVideoEmbed
                platform={featuredPlatform}
                embedUrl={featuredVideo.embedUrl}
                videoUrl={
                  featuredVideo.videoUrl ||
                  (featuredVideo.youtubeId
                    ? `https://www.youtube.com/watch?v=${featuredVideo.youtubeId}`
                    : "#")
                }
                title={featuredVideo.title}
                thumbnailUrl={featuredVideo.thumbnailUrl}
                forceExternal={featuredPlatform !== "YOUTUBE"}
              />
              <div className="border-t border-jepang-border p-5 md:p-6">
                <Link
                  href={`/tv/${featuredVideo.slug}`}
                  className="group block"
                  data-testid={`tv-featured-title-${featuredVideo.slug}`}
                >
                  <h3 className="font-heading text-xl md:text-2xl font-bold tracking-tight group-hover:text-jepang-red transition-colors">
                    {featuredVideo.title}
                  </h3>
                </Link>
                {featuredVideo.description ? (
                  <p className="mt-2 text-sm text-jepang-muted line-clamp-2">
                    {featuredVideo.description}
                  </p>
                ) : null}
              </div>
            </div>

            {sidebarVideos.length > 0 ? (
              <aside className="bg-jepang-red lg:border-l border-jepang-border">
                <div className="border-b border-white/15 px-4 py-3">
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-white/80">
                    Video Terbaru
                  </p>
                </div>
                <div>
                  {sidebarVideos.map((video) => (
                    <SidebarItem key={video.id} video={video} />
                  ))}
                </div>
              </aside>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex justify-center md:hidden">
          <Link href="/tv" className="jepang-btn-primary inline-flex items-center gap-2">
            Semua Video <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
