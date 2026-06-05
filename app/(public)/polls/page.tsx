"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Award, BarChart3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "@/components/SectionHeader";
import { cn } from "@/lib/utils";

/* ─── Skeleton ───────────────────────────────────────── */
function PollCardSkeleton({ tall }: { tall?: boolean }) {
  return (
    <div
      className={cn(
        "animate-pulse border border-jepang-border bg-white",
        tall && "row-span-2",
      )}
    >
      {tall && <div className="w-full aspect-video bg-jepang-border" />}
      <div className="p-5 space-y-3">
        <div className="h-4 w-20 bg-jepang-border" />
        <div className="h-6 w-3/4 bg-jepang-border" />
        <div className="h-4 w-full bg-jepang-border" />
        <div className="h-4 w-2/3 bg-jepang-border" />
        <div className="h-4 w-16 bg-jepang-border mt-2" />
      </div>
    </div>
  );
}

/* ─── Poll Card ──────────────────────────────────────── */
function PollCard({ poll, tall }: { poll: any; tall: boolean }) {
  const totalVotes = poll.totalVotes || 0;
  const questionCount = poll.questionCount || 1;

  return (
    <Link
      href={`/polls/${poll.slug}`}
      className={cn(
        "group block border border-jepang-border bg-white hover:border-foreground transition-colors",
        tall && "row-span-2",
      )}
      data-testid={`poll-card-${poll.slug}`}
    >
      {/* Thumbnail — hanya jika punya gambar */}
      {poll.thumbnailUrl && (
        <div className="relative w-full overflow-hidden">
          {/* Aspect ratio: tall card pakai 16/9, biasa 16/7 */}
          <div className={cn("w-full", tall ? "aspect-video" : "aspect-16/7")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poll.thumbnailUrl}
              alt={poll.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col gap-2">
        {/* Badge + Points */}
        <div className="flex items-center justify-between">
          <Badge variant={poll.pollType === "VOTING" ? "red" : "black"}>
            {poll.pollType === "VOTING" ? "VOTING" : "POLLING"}
          </Badge>
          <span className="flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-jepang-red font-bold">
            <Award size={11} strokeWidth={1.5} /> +{poll.pointsReward || 5} POIN
          </span>
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-heading font-bold tracking-tight leading-tight",
            tall ? "text-2xl" : "text-lg",
          )}
        >
          {poll.title}
        </h3>

        {/* Description */}
        {poll.description && (
          <p
            className={cn(
              "text-jepang-muted text-sm leading-relaxed",
              !tall && "line-clamp-2",
            )}
          >
            {poll.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-jepang-border flex items-center justify-between text-xs font-mono uppercase tracking-wider">
          <span className="text-jepang-muted flex items-center gap-1">
            <BarChart3 size={11} strokeWidth={1.5} /> {totalVotes} VOTES
            {questionCount > 1 && (
              <span className="ml-2 border border-jepang-border px-1.5 py-0.5 text-[10px]">
                {questionCount} PERTANYAAN
              </span>
            )}
          </span>
          <span className="text-jepang-red font-bold flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
            Ikuti <ChevronRight size={12} strokeWidth={2.5} />
          </span>
        </div>
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
  const PER_PAGE = 9; // multiple of 3 agar grid rapi

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

  return (
    <div className="bg-white min-h-screen" data-testid="poll-list-page">
      <SectionHeader
        label="投票 / POLLING"
        title="Polling dan Voting"
        subtitle="Suarakan pendapatmu dan ikuti aktivitas voting komunitas Jepangku!"
      />

      <div className="px-4 mx-auto max-w-7xl py-12">
        {loading ? (
          /* Skeleton — tiru layout 3 kolom */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto gap-5">
            {/* card ke-3 di setiap 9 punya thumbnail (tall) */}
            {[...Array(PER_PAGE)].map((_, i) => (
              <PollCardSkeleton key={i} tall={(i + 1) % 3 === 0} />
            ))}
          </div>
        ) : polls.length > 0 ? (
          <>
            {/*
              Layout grid 3 kolom dengan auto-rows.
              Kartu yang punya thumbnail di-span 2 baris (row-span-2).
              Kartu tanpa thumbnail mengisi 1 baris normal.
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[1fr] gap-5">
              {polls.map((poll: any) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  tall={Boolean(poll.thumbnailUrl)}
                />
              ))}
            </div>

            {polls.length < total && (
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
          <div className="text-center py-24" data-testid="no-polls">
            <MessageSquare
              size={48}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-jepang-muted"
            />
            <p className="font-heading font-bold text-2xl mb-2">
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
