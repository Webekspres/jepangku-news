"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { imageLoadingProps } from "@/lib/image-loading";
import { MessageSquare, Award, BarChart3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SectionHeader from "@/components/SectionHeader";
import {
  InteractiveBentoGrid,
  interactiveBentoSpan,
  resolveThumbnailUrl,
} from "@/components/interactive/InteractiveBentoGrid";
import InteractiveBentoSkeleton, {
  InteractiveBentoLoadMoreSkeleton,
} from "@/components/skeletons/InteractiveBentoSkeleton";
import { cn } from "@/lib/utils";

/* ─── Poll Card ──────────────────────────────────────── */
function PollCard({ poll }: { poll: any }) {
  const totalVotes = poll.totalVotes || 0;
  const questionCount = poll.questionCount || 1;
  const thumbnailUrl = resolveThumbnailUrl(poll);
  const hasImage = Boolean(thumbnailUrl);

  const footer = (
    <div className="mt-auto flex items-center justify-between border-t border-jepang-border pt-3 text-xs font-mono uppercase tracking-wider">
      <span className="flex items-center gap-1 text-jepang-muted">
        <BarChart3 size={11} strokeWidth={1.5} /> {totalVotes} VOTES
        {questionCount > 1 && (
          <span className="ml-2 border border-jepang-border px-1.5 py-0.5 text-[10px]">
            {questionCount} PERTANYAAN
          </span>
        )}
      </span>
      <span className="flex items-center gap-0.5 font-bold text-jepang-red transition-all group-hover:gap-1.5">
        Ikuti <ChevronRight size={12} strokeWidth={2.5} />
      </span>
    </div>
  );

  const metaRow = (
    <div className="flex items-center justify-between gap-2">
      <Badge variant={poll.pollType === "VOTING" ? "red" : "black"}>
        {poll.pollType === "VOTING" ? "VOTING" : "POLLING"}
      </Badge>
      <span className="flex shrink-0 items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-jepang-red">
        <Award size={11} strokeWidth={1.5} /> +{poll.pointsReward || 5} POIN
      </span>
    </div>
  );

  if (hasImage) {
    return (
      <Link
        href={`/polls/${poll.slug}`}
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-lg border border-jepang-border bg-white transition-colors hover:border-jepang-navy/30 hover:shadow-sm",
          interactiveBentoSpan(true),
        )}
        data-testid={`poll-card-${poll.slug}`}
      >
        <div className="relative aspect-16/10 shrink-0 overflow-hidden bg-jepang-off-white">
          <Image
            src={thumbnailUrl!}
            alt={poll.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            {...imageLoadingProps(false)}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          {metaRow}
          <h3 className="font-heading text-lg font-bold leading-tight tracking-tight group-hover:text-jepang-red transition-colors">
            {poll.title}
          </h3>
          {poll.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-jepang-muted">
              {poll.description}
            </p>
          )}
          {footer}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/polls/${poll.slug}`}
      className={cn(
        "group flex h-full flex-col rounded-lg border border-jepang-border bg-white p-5 transition-colors hover:border-jepang-navy/30 hover:shadow-sm",
        interactiveBentoSpan(false),
      )}
      data-testid={`poll-card-${poll.slug}`}
    >
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            {metaRow}
            <h3 className="font-heading text-base font-bold leading-snug tracking-tight group-hover:text-jepang-red transition-colors line-clamp-2">
              {poll.title}
            </h3>
          </div>
        </div>
        {poll.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-jepang-muted">
            {poll.description}
          </p>
        )}
        {footer}
      </div>
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function PollListPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  useEffect(() => {
    loadPolls(1, true);
  }, []);

  const loadPolls = async (pageNum: number, reset = false) => {
    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        status: "ACTIVE",
        limit: String(PER_PAGE),
        page: String(pageNum),
      });
      const data = await fetch(`/api/polls?${params}`).then((r) => r.json());
      const incoming: any[] = Array.isArray(data.polls) ? data.polls : [];

      if (reset) {
        setPolls(incoming);
      } else {
        setPolls((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          return [...prev, ...incoming.filter((p) => !ids.has(p.id))];
        });
      }
      setTotal(Number(data.total || 0));
      setPage(pageNum);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const hasMore = polls.length < total;

  return (
    <div className="bg-white min-h-screen" data-testid="poll-list-page">
      <SectionHeader
        label="投票 / POLLING"
        title="Polling dan Voting"
        subtitle="Suarakan pendapatmu dan ikuti aktivitas voting komunitas Jepangku!"
      />

      <div className="px-4 mx-auto max-w-7xl py-12">
        {loading ? (
          <InteractiveBentoSkeleton count={PER_PAGE} />
        ) : polls.length > 0 ? (
          <>
            <InteractiveBentoGrid>
              {polls.map((poll: any) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
              {loadingMore && <InteractiveBentoLoadMoreSkeleton count={3} />}
            </InteractiveBentoGrid>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => loadPolls(page + 1)}
                  disabled={loadingMore}
                  data-testid="load-more"
                >
                  {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-24 text-center" data-testid="no-polls">
            <MessageSquare
              size={48}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-jepang-muted"
            />
            <p className="mb-2 font-heading text-2xl font-bold">
              Tidak ada polling aktif
            </p>
            <p className="text-jepang-muted">
              Coba lagi nanti untuk polling baru!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
