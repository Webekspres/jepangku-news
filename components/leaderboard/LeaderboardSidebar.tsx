"use client";

import { useEffect, useState } from "react";
import { useAuth, isAuthUser, getAuthLoginPath, getAuthRegisterPath } from "@/contexts/AuthContext";
import { parseApiResponse } from "@/lib/fetch-api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, BarChart3, ArrowRight } from "lucide-react";
import CardCoverImage from "@/components/CardCoverImage";
import { resolveThumbnailUrl } from "@/lib/image-placeholder";
import SidebarAdSlot from "@/components/home/SidebarAdSlot";
import { useAdSlot } from "@/hooks/useAdSlot";
import { cn } from "@/lib/utils";

type Quiz = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  questionCount?: number;
  pointsReward?: number;
};

type Poll = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  pollType: string;
  pointsReward?: number;
  totalVotes?: number;
};

export default function LeaderboardSidebar() {
  const { user, loading: _authLoading } = useAuth();
  const isAuthenticated = isAuthUser(user);

  const [, setTrendingArticles] = useState<any[]>([]);
  const [, setLoadingArticles] = useState(true);

  const [, setTopQuizzes] = useState<Quiz[]>([]);
  const [, setLoadingQuizzes] = useState(true);

  const [topPolls, setTopPolls] = useState<Poll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);

  const {
    data: sidebarAd,
    isLoading: sidebarAdLoading,
    error: sidebarAdError,
  } = useAdSlot("sidebar", { immediate: true });

  // Load artikel trending berdasarkan total reactions
  useEffect(() => {
    let cancelled = false;

    async function loadTrendingArticles() {
      setLoadingArticles(true);
      try {
        const params = new URLSearchParams({
          sort: "reactions",
          limit: "4",
        });
        const res = await fetch(`/api/articles?${params}`);
        if (!res.ok) throw new Error("Failed to load articles");
        const data = await parseApiResponse(res);
        const items = Array.isArray(data.articles) ? data.articles : [];

        if (!cancelled) {
          setTrendingArticles(items);
        }
      } catch {
        if (!cancelled) setTrendingArticles([]);
      } finally {
        if (!cancelled) setLoadingArticles(false);
      }
    }

    void loadTrendingArticles();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load top quizzes berdasarkan poin reward
  useEffect(() => {
    let cancelled = false;

    async function loadTopQuizzes() {
      setLoadingQuizzes(true);
      try {
        const params = new URLSearchParams({
          status: "ACTIVE",
          sort: "pointsReward:desc",
          limit: "3",
        });
        const res = await fetch(`/api/quizzes?${params}`);
        if (!res.ok) throw new Error("Failed to load quizzes");
        const data = await parseApiResponse(res);
        const items = Array.isArray(data.quizzes) ? data.quizzes : [];

        if (!cancelled) {
          setTopQuizzes(items);
        }
      } catch {
        if (!cancelled) setTopQuizzes([]);
      } finally {
        if (!cancelled) setLoadingQuizzes(false);
      }
    }

    void loadTopQuizzes();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load top polls berdasarkan poin reward
  useEffect(() => {
    let cancelled = false;

    async function loadTopPolls() {
      setLoadingPolls(true);
      try {
        const params = new URLSearchParams({
          status: "ACTIVE",
          sort: "pointsReward:desc",
          limit: "3",
        });
        const res = await fetch(`/api/polls?${params}`);
        if (!res.ok) throw new Error("Failed to load polls");
        const data = await parseApiResponse(res);
        const items = Array.isArray(data.polls) ? data.polls : [];

        if (!cancelled) {
          setTopPolls(items);
        }
      } catch {
        if (!cancelled) setTopPolls([]);
      } finally {
        if (!cancelled) setLoadingPolls(false);
      }
    }

    void loadTopPolls();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6" data-testid="leaderboard-sidebar">
      {/* CTA - Join atau Tambah Poin */}
      <Card className="border border-jepang-border bg-linear-to-br from-jepang-red via-jepang-red to-red-700 text-white overflow-hidden relative">
        <CardContent className="p-6 relative z-10">
          <div className="absolute top-0 right-0 opacity-10">
            <Trophy size={100} strokeWidth={1} />
          </div>
          
          {!isAuthenticated ? (
            <>
              <h3 className="font-heading font-black text-xl mb-2">
                Bergabung Sekarang!
              </h3>
              <p className="text-sm text-white/90 mb-4 leading-relaxed">
                Daftarkan dirimu dan mulai kumpulkan poin dengan membaca artikel, ikut kuis, dan polling!
              </p>
              <Link href={getAuthRegisterPath()}>
                <Button
                  variant="outline"
                  className="w-full bg-white text-jepang-red hover:bg-white/90 hover:text-jepang-red border-white"
                  data-testid="leaderboard-cta-signup"
                >
                  Daftar Gratis
                </Button>
              </Link>
              <Link href={getAuthLoginPath()} className="block mt-2">
                <Button
                  variant="ghost"
                  className="w-full text-white hover:bg-white/10 hover:text-white"
                  data-testid="leaderboard-cta-signin"
                >
                  Sudah Punya Akun? Masuk
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h3 className="font-heading font-black text-xl mb-2">
                Tingkatkan Poinmu!
              </h3>
              <p className="text-sm text-white/90 mb-4 leading-relaxed">
                Naik peringkat dengan baca artikel menarik, ikuti kuis yang ada, dan berpartisipasi di polling!
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Rekomendasi Polling */}
      {isAuthenticated && (
        <Card className="border border-jepang-border bg-white">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-jepang-border pb-3">
              <div className="flex items-center gap-2">
                <BarChart3
                  size={18}
                  strokeWidth={1.5}
                  className="shrink-0 text-jepang-red"
                />
                <h3 className="small-caps">投票 / Polling Aktif</h3>
              </div>
              <Link
                href="/polls"
                className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:text-jepang-red"
                data-testid="leaderboard-polls-view-all"
              >
                Semua <ArrowRight size={10} />
              </Link>
            </div>

            {loadingPolls ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="flex animate-pulse items-center gap-3 py-2">
                    <div className="h-14 w-18 shrink-0 rounded-sm bg-jepang-border" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-full rounded bg-jepang-border" />
                      <div className="h-3 w-2/3 rounded bg-jepang-border" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topPolls.length > 0 ? (
              <div className="space-y-0">
                {topPolls.map((poll) => (
                  <div
                    key={poll.id}
                    className="flex items-center gap-3 border-b border-jepang-border py-3 last:border-b-0"
                  >
                    <Link
                      href={`/polls/${poll.slug}`}
                      className="relative h-14 w-18 shrink-0 overflow-hidden rounded-sm bg-jepang-off-white"
                      data-testid={`leaderboard-poll-thumbnail-${poll.slug}`}
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
                        data-testid={`leaderboard-poll-link-${poll.slug}`}
                      >
                        {poll.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-2 font-mono text-[10px] tracking-wider">
                        <span className={cn(
                          "font-bold uppercase",
                          poll.pollType === "VOTING" ? "text-jepang-red" : "text-jepang-black"
                        )}>
                          {poll.pollType === "VOTING" ? "VOTING" : "POLLING"}
                        </span>
                        <span className="font-bold text-jepang-red">
                          +{poll.pointsReward ?? 5} poin
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-jepang-muted">
                Belum ada polling tersedia
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Iklan */}
      <SidebarAdSlot
        data={sidebarAd}
        loading={sidebarAdLoading}
        error={sidebarAdError}
        testId="leaderboard-sidebar-ad"
      />
    </div>
  );
}
