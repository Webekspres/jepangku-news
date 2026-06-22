"use client";

import Link from "next/link";
import CardCoverImage from "@/components/CardCoverImage";
import { ArrowRight, BarChart3 } from "lucide-react";
import { resolveThumbnailUrl } from "@/lib/image-placeholder";
import { cn } from "@/lib/utils";

export type RecommendedPollItem = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  totalVotes?: number;
};

type RecommendedPollsPanelProps = {
  polls: RecommendedPollItem[];
  loading?: boolean;
  className?: string;
  testIdPrefix?: string;
};

export default function RecommendedPollsPanel({
  polls,
  loading = false,
  className,
  testIdPrefix = "poll-sidebar-recommended",
}: RecommendedPollsPanelProps) {
  return (
    <aside
      className={cn(
        "flex flex-col rounded-lg border border-jepang-border bg-white p-5",
        className,
      )}
      aria-label="Polling lainnya"
      data-testid={`${testIdPrefix}-panel`}
    >
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-jepang-border pb-3">
        <div className="flex items-center gap-2">
          <BarChart3
            size={18}
            strokeWidth={1.5}
            className="shrink-0 text-jepang-red"
          />
          <h3 className="small-caps">ポール / Poll Lainnya</h3>
        </div>
        <Link
          href="/polls"
          className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:text-jepang-red"
          data-testid={`${testIdPrefix}-view-all`}
        >
          Semua <ArrowRight size={10} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3" data-testid={`${testIdPrefix}-loading`}>
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="flex animate-pulse items-center gap-3 py-2">
              <div className="h-14 w-[72px] shrink-0 rounded-sm bg-jepang-border" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-full rounded bg-jepang-border" />
                <div className="h-3 w-2/3 rounded bg-jepang-border" />
              </div>
            </div>
          ))}
        </div>
      ) : polls.length > 0 ? (
        <div className="flex-1 space-y-0">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="flex items-center gap-3 border-b border-jepang-border py-3 last:border-b-0"
            >
              <Link
                href={`/polls/${poll.slug}`}
                className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded-sm bg-jepang-off-white md:h-16 md:w-20"
                data-testid={`${testIdPrefix}-thumbnail-${poll.slug}`}
              >
                <CardCoverImage
                  src={resolveThumbnailUrl(poll)}
                  alt={poll.title}
                  sizes="70px"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/polls/${poll.slug}`}
                  className="line-clamp-2 font-heading text-sm font-bold leading-snug transition-colors hover:text-jepang-red"
                  data-testid={`${testIdPrefix}-link-${poll.slug}`}
                >
                  {poll.title}
                </Link>
                <p className="mt-1 font-mono text-[10px] tracking-wider text-zinc-600">
                  {(poll.totalVotes ?? 0).toLocaleString("id-ID")} suara
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p
          className="py-8 text-center text-sm text-jepang-muted"
          data-testid={`${testIdPrefix}-empty`}
        >
          Belum ada polling lain
        </p>
      )}
    </aside>
  );
}
