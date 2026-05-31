"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { MessageSquare, Award, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import SectionHeader from "@/components/SectionHeader";
import PollCardSkeleton from "@/components/skeletons/PollCardSkeleton";

export default function PollListPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [polls, setPolls] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  useEffect(() => {
    loadPolls(1, true);
  }, []);

  const loadPolls = async (pageNum: number, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.set("status", "ACTIVE");
      params.set("limit", String(PER_PAGE));
      params.set("page", String(pageNum));

      const data = await fetch(`/api/polls?${params}`).then((r) => r.json());
      const incomingPolls = Array.isArray(data.polls) ? data.polls : [];

      if (reset) {
        setPolls(incomingPolls);
      } else {
        setPolls((prev) => {
          const existingIds = new Set(prev.map((poll) => poll.id));
          return [
            ...prev,
            ...incomingPolls.filter(
              (poll: any) => poll.id && !existingIds.has(poll.id),
            ),
          ];
        });
      }

      setTotal(Number(data.total || 0));
      setPage(pageNum);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleVote = async (
    pollId: string,
    optionId: string,
    pollSlug: string,
  ) => {
    if (!user) {
      toast.error("Silakan masuk terlebih dahulu untuk memilih");
      router.push("/login");
      return;
    }
    setVoting(pollId);
    try {
      await fetch(`/api/polls/${pollSlug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option_id: optionId }),
      }).then((r) => {
        if (!r.ok)
          return r.json().then((e) => {
            throw new Error(e.error);
          });
        return r.json();
      });
      toast.success("+5 poin untuk voting!");
      refreshUser();
      loadPolls(1, true);
    } catch (e: any) {
      toast.error(e.message || "Gagal melakukan voting");
    } finally {
      setVoting(null);
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[...Array(PER_PAGE)].map((_, idx) => (
              <PollCardSkeleton key={idx} />
            ))}
          </div>
        ) : polls.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {polls.map((poll: any) => {
                const totalVotes =
                  poll.options?.reduce(
                    (sum: number, opt: any) => sum + (opt.voteCount || 0),
                    0,
                  ) || 0;
                return (
                  <Card
                    key={poll.id}
                    className="border border-foreground p-6"
                    data-testid={`poll-card-${poll.slug}`}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant={poll.pollType === "VOTING" ? "red" : "black"}
                        >
                          {poll.pollType?.toUpperCase()}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-jepang-red font-bold">
                          <Award size={12} strokeWidth={1.5} /> +
                          {poll.pointsReward || 5} PTS
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-2xl tracking-tight mb-4">
                        {poll.title}
                      </h3>
                      {poll.description && (
                        <p className="text-sm text-jepang-muted mb-4">
                          {poll.description}
                        </p>
                      )}
                      <div className="space-y-2 mb-4">
                        {poll.options?.map((option: any, idx: number) => {
                          const pct =
                            totalVotes > 0
                              ? Math.round(
                                  (option.voteCount / totalVotes) * 100,
                                )
                              : 0;
                          return (
                            <button
                              key={option.id}
                              onClick={() =>
                                handleVote(poll.id, option.id, poll.slug)
                              }
                              disabled={voting === poll.id}
                              className="w-full text-left border border-jepang-border hover:border-foreground transition-colors overflow-hidden"
                              data-testid={`poll-${poll.slug}-option-${idx}`}
                            >
                              <div className="relative p-3">
                                <Progress
                                  value={pct}
                                  className="absolute inset-0 h-full opacity-10"
                                />
                                <div className="relative flex items-center justify-between">
                                  <span className="font-semibold text-sm">
                                    {option.optionText}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-jepang-muted">
                                      {option.voteCount || 0}
                                    </span>
                                    <span className="text-sm font-mono font-bold text-jepang-red">
                                      {pct}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="pt-3 border-t border-jepang-border flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                        <span className="text-jepang-muted flex items-center gap-1">
                          <BarChart3 size={12} strokeWidth={1.5} /> {totalVotes}{" "}
                          TOTAL VOTES
                        </span>
                        <Link
                          href={`/polls/${poll.slug}`}
                          className="text-jepang-red hover:underline font-bold"
                          data-testid={`poll-detail-${poll.slug}`}
                        >
                          Detail →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
