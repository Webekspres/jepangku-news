"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp } from "lucide-react";
import { imageLoadingProps } from "@/lib/image-loading";
import { cn } from "@/lib/utils";

export type TrendingVideoItem = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  viewCount?: number;
};

type TrendingVideosPanelProps = {
  videos: TrendingVideoItem[];
  loading?: boolean;
  className?: string;
  testIdPrefix?: string;
};

export default function TrendingVideosPanel({
  videos,
  loading = false,
  className,
  testIdPrefix = "video-sidebar-trending",
}: TrendingVideosPanelProps) {
  return (
    <aside
      className={cn(
        "flex flex-col rounded-lg border border-jepang-border bg-white p-5",
        className,
      )}
      aria-label="Video sedang tren"
      data-testid={`${testIdPrefix}-panel`}
    >
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-jepang-border pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp
            size={18}
            strokeWidth={1.5}
            className="shrink-0 text-jepang-red"
          />
          <h3 className="small-caps">トレンド / Sedang Tren</h3>
        </div>
        <Link
          href="/tv"
          className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:text-jepang-red"
          data-testid={`${testIdPrefix}-view-all`}
        >
          Semua <ArrowRight size={10} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3" data-testid={`${testIdPrefix}-loading`}>
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex animate-pulse items-center gap-3 py-2">
              <div className="h-14 w-[72px] shrink-0 rounded-sm bg-jepang-border" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-full rounded bg-jepang-border" />
                <div className="h-3 w-1/2 rounded bg-jepang-border" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="flex-1 space-y-0">
          {videos.map((video, idx) => (
            <div
              key={video.id}
              className="flex items-center gap-3 border-b border-jepang-border py-3 last:border-b-0"
            >
              <span className="w-5 shrink-0 text-center font-mono text-xs font-bold text-jepang-red">
                {idx + 1}
              </span>
              <Link
                href={`/tv/${video.slug}`}
                className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded-sm bg-jepang-off-white md:h-16 md:w-20"
                data-testid={`${testIdPrefix}-thumbnail-${video.slug}`}
              >
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                    {...imageLoadingProps(false)}
                  />
                ) : null}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/tv/${video.slug}`}
                  className="line-clamp-2 font-heading text-sm font-bold leading-snug transition-colors hover:text-jepang-red"
                  data-testid={`${testIdPrefix}-link-${video.slug}`}
                >
                  {video.title}
                </Link>
                {(video.viewCount ?? 0) > 0 ? (
                  <p className="mt-1 font-mono text-[10px] tracking-wider text-zinc-600">
                    {video.viewCount!.toLocaleString("id-ID")} views
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p
          className="py-8 text-center text-sm text-jepang-muted"
          data-testid={`${testIdPrefix}-empty`}
        >
          Belum ada video tren
        </p>
      )}
    </aside>
  );
}
