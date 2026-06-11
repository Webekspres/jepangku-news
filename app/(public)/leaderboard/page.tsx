"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import AuthorLink from "@/components/AuthorLink";
import { Trophy, Award, Crown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SectionHeader from "@/components/SectionHeader";
import LeaderboardRowSkeleton from "@/components/skeletons/LeaderboardRowSkeleton";
import LeaderboardAvatar from "@/components/leaderboard/LeaderboardAvatar";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard/weekly")
      .then((r) => r.json())
      .then((d) => {
        setLeaderboard(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white min-h-screen" data-testid="leaderboard-page">
      <SectionHeader
        label="ランキング / Peringkat"
        title="Peringkat Mingguan"
        subtitle="Performa terbaik minggu ini berdasarkan poin aktivitas."
      />

      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 items-end">
                {[
                  { heights: "h-32", colors: "bg-zinc-300" },
                  { heights: "h-44", colors: "bg-jepang-red" },
                  { heights: "h-28", colors: "bg-zinc-200" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-end h-full animate-pulse"
                  >
                    <div className="mb-2 h-8 w-8  bg-jepang-red/10" />
                    <div className="w-16 h-16 bg-jepang-red/10 mb-2" />
                    <div className="h-3 w-20 bg-jepang-red/10 mb-1" />
                    <div className="h-2 w-16 bg-jepang-red/10 mb-3" />
                    <div className={`${item.heights} ${item.colors} w-full`} />
                  </div>
                ))}
              </div>
              <Card className="border border-foreground">
                <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                    SEMUA PERINGKAT
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  {[...Array(6)].map((_, idx) => (
                    <LeaderboardRowSkeleton key={idx} />
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : leaderboard.length > 0 ? (
            <>
              {leaderboard.length >= 3 && (
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 items-end">
                  {[leaderboard[1], leaderboard[0], leaderboard[2]].map(
                    (entry: any, idx: number) => {
                      const positions = [2, 1, 3];
                      const heights = ["h-32", "h-44", "h-28"];
                      const colors = [
                        "bg-zinc-300",
                        "bg-jepang-red",
                        "bg-zinc-200",
                      ];
                      const textColors = [
                        "text-foreground",
                        "text-white",
                        "text-foreground",
                      ];
                      const realIdx = positions[idx];
                      return (
                        <div
                          key={entry.userId}
                          className="flex flex-col items-center justify-end h-full"
                          data-testid={`podium-${realIdx}`}
                        >
                          <div className="mb-2">
                            {realIdx === 1 && (
                              <Crown
                                size={32}
                                strokeWidth={1.5}
                                className="text-jepang-red"
                              />
                            )}
                          </div>
                          <LeaderboardAvatar
                            avatarUrl={entry.avatarUrl}
                            displayName={entry.displayName}
                            size="lg"
                            className="mb-2"
                          />
                          <AuthorLink
                            username={entry.profileLinked ? entry.username : null}
                            className="font-bold text-sm text-center truncate w-full max-w-30 block"
                          >
                            {entry.displayName}
                          </AuthorLink>
                          <AuthorLink
                            username={entry.profileLinked ? entry.username : null}
                            className="text-xs text-jepang-muted font-mono block"
                          >
                            @{entry.username}
                          </AuthorLink>
                          <div
                            className={`${heights[idx]} ${colors[idx]} ${textColors[idx]} w-full flex flex-col items-center justify-end pb-3 mt-3 rounded-t-lg border border-jepang-border`}
                          >
                            <p className="font-mono font-black text-3xl">
                              #{realIdx}
                            </p>
                            <p className="text-xs font-mono">
                              {entry.totalXp} XP
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}

              <Card className="border border-foreground">
                <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                    SEMUA PERINGKAT
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  {leaderboard.map((entry: any) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 px-6 py-4 border-b border-jepang-border last:border-b-0 ${entry.rank <= 3 ? "bg-jepang-off-white" : ""}`}
                      data-testid={`leaderboard-entry-${entry.rank}`}
                    >
                      <span
                        className={`font-mono font-black text-2xl w-12 ${entry.rank === 1 ? "text-jepang-red" : "text-foreground"}`}
                      >
                        #{entry.rank}
                      </span>
                      <LeaderboardAvatar
                        avatarUrl={entry.avatarUrl}
                        displayName={entry.displayName}
                      />
                      <div className="flex-1 min-w-0">
                        <AuthorLink
                          username={entry.profileLinked ? entry.username : null}
                          className="font-semibold truncate block"
                        >
                          {entry.displayName}
                        </AuthorLink>
                        <AuthorLink
                          username={entry.profileLinked ? entry.username : null}
                          className="text-xs text-jepang-muted font-mono block"
                        >
                          @{entry.username}
                        </AuthorLink>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black text-xl text-jepang-red flex items-center gap-1">
                          <Award size={14} strokeWidth={1.5} />{" "}
                          {entry.totalXp}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-jepang-muted">
                          POIN
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-24" data-testid="empty-leaderboard">
              <Trophy
                size={48}
                strokeWidth={1.5}
                className="mx-auto mb-4 text-jepang-muted"
              />
              <p className="font-heading font-bold text-2xl mb-2">
                Belum ada peringkat
              </p>
              <p className="text-jepang-muted">
                Jadilah yang pertama mengumpulkan poin!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
