"use client";
export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import AuthorLink from "@/components/AuthorLink";
import LeaderboardScore from "@/components/leaderboard/LeaderboardScore";
import { Trophy, Crown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SectionHeader from "@/components/SectionHeader";
import LeaderboardRowSkeleton from "@/components/skeletons/LeaderboardRowSkeleton";
import LeaderboardAvatar from "@/components/leaderboard/LeaderboardAvatar";
import LeaderboardTableRow, {
  LeaderboardTableSeparator,
} from "@/components/leaderboard/LeaderboardTableRow";
import {
  LEADERBOARD_PERIOD_LABELS,
  LEADERBOARD_PERIOD_SHORT,
  type LeaderboardPeriod,
} from "@/lib/leaderboard/period";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";

const PERIOD_OPTIONS: LeaderboardPeriod[] = ["weekly", "monthly", "sepanjang-waktu"];
const LEADERBOARD_TOP_LIMIT = 10;

const PERIOD_SUBTITLES: Record<LeaderboardPeriod, string> = {
  weekly:
    "Peringkat berdasarkan poin yang dikumpulkan minggu kalender ini (Sen-Min, WIB). Format: poin periode / total.",
  monthly:
    "Peringkat berdasarkan poin bulan kalender ini. Format: poin periode / total.",
  "sepanjang-waktu": "Peringkat berdasarkan total poin portal sepanjang waktu.",
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserEntry, setCurrentUserEntry] =
    useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(async (selected: LeaderboardPeriod) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/leaderboard?period=${selected}&limit=${LEADERBOARD_TOP_LIMIT}`,
      );
      const data = await res.json();
      setLeaderboard(Array.isArray(data?.items) ? data.items : []);
      setCurrentUserEntry(data?.currentUser ?? null);
    } catch {
      setLeaderboard([]);
      setCurrentUserEntry(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard(period);
  }, [period, loadLeaderboard]);

  return (
    <div className="bg-white min-h-screen" data-testid="leaderboard-page">
      <SectionHeader
        label="ランキング / Peringkat"
        title={`Peringkat ${LEADERBOARD_PERIOD_SHORT[period]}`}
        subtitle={PERIOD_SUBTITLES[period]}
      />

      {/* tambahkan aside yang isinya ajakan untuk bergabung di jepangku jika belum terautentikasi jika sudah terautentikasi tampilkan ajakan menambah poin dengan menampilkan rekomendasi artikel, kuis dan polling, dibawah itu tampilkan iklan */}

      <div className="px-4 mx-auto max-w-7xl py-8">
        <div className="max-w-3xl mx-auto mb-8">
          <div
            className="flex flex-wrap gap-2 border border-jepang-border p-1 bg-jepang-off-white"
            role="tablist"
            aria-label="Periode leaderboard"
          >
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={period === option}
                onClick={() => setPeriod(option)}
                data-state={period === option ? "active" : "inactive"}
                className={`flex-1 min-w-28 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  period === option
                    ? "bg-jepang-red text-white"
                    : "text-jepang-muted hover:text-foreground hover:bg-white"
                }`}
                data-testid={`leaderboard-period-${option}`}
              >
                {LEADERBOARD_PERIOD_SHORT[option]}
              </button>
            ))}
          </div>
        </div>

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
                    <div className="mb-2 h-8 w-8 bg-jepang-red/10" />
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
                    (entry, idx) => {
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
                            className={`${heights[idx]} ${colors[idx]} ${textColors[idx]} w-full flex flex-col items-center justify-end pb-3 pt-2 mt-3 rounded-t-lg border border-jepang-border gap-1`}
                          >
                            <p className="font-mono font-black text-3xl">
                              #{realIdx}
                            </p>
                            <LeaderboardScore
                              period={period}
                              periodPoints={entry.periodPoints}
                              totalPoints={entry.totalPoints}
                              variant="podium"
                              inverted={idx === 1}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}

              <Card className="border border-foreground">
                <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-center">
                    TOP {LEADERBOARD_TOP_LIMIT} — {LEADERBOARD_PERIOD_LABELS[period]}
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  {leaderboard.map((entry) => (
                    <LeaderboardTableRow
                      key={entry.userId}
                      entry={entry}
                      period={period}
                    />
                  ))}
                  {currentUserEntry ? (
                    <>
                      <LeaderboardTableSeparator />
                      <LeaderboardTableRow
                        entry={currentUserEntry}
                        period={period}
                        isCurrentUser
                      />
                    </>
                  ) : null}
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
                Jadilah yang pertama mengumpulkan poin di periode ini!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
