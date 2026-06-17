"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import LeaderboardAvatar from "@/components/leaderboard/LeaderboardAvatar";
import LeaderboardScore from "@/components/leaderboard/LeaderboardScore";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LEADERBOARD_PERIOD_SHORT,
  type LeaderboardPeriod,
} from "@/lib/leaderboard/period";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";

const PERIODS: LeaderboardPeriod[] = ["weekly", "monthly", "sepanjang-waktu"];

type MonitorResponse = {
  period: LeaderboardPeriod;
  periodLabel: string;
  items: LeaderboardEntry[];
  stats: {
    participants: number;
    topListPeriodPoints: number;
    totalPeriodPoints: number;
    totalAllTimePoints: number;
  };
};

export default function AdminLeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const [data, setData] = useState<MonitorResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/leaderboard?period=${period}&limit=50`)
      .then((r) => r.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="w-full px-4 py-8 lg:px-6" data-testid="admin-leaderboard">
      <SectionHeader
        label="管理 / ADMIN"
        title="Monitor Leaderboard"
        subtitle="Pantau peringkat poin pengguna per periode"
        className="border-b border-jepang-border bg-jepang-navy text-white"
        fullWidth
      />

      <div className="py-8 space-y-6">
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((option) => (
            <Button
              key={option}
              size="sm"
              variant={period === option ? "default" : "outline"}
              onClick={() => setPeriod(option)}
            >
              {LEADERBOARD_PERIOD_SHORT[option]}
            </Button>
          ))}
          <Button size="sm" variant="outline" className="ml-auto" asChild>
            <Link href="/leaderboard" target="_blank">
              Lihat Publik
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBox key={i} height="5rem" width="100%" />
            ))}
          </div>
        ) : data ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Peserta Aktif", value: data.stats.participants },
                { label: "Total Poin Periode", value: data.stats.totalPeriodPoints },
                { label: "Top 50 (periode)", value: data.stats.topListPeriodPoints },
                { label: "Total Sepanjang Waktu", value: data.stats.totalAllTimePoints },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-wider text-jepang-muted">
                      {stat.label}
                    </p>
                    <p className="font-mono font-black text-3xl mt-2">
                      {stat.value.toLocaleString("id-ID")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-0 divide-y divide-jepang-border">
                {data.items.length === 0 ? (
                  <p className="p-8 text-center text-sm text-jepang-muted">
                    Belum ada data leaderboard untuk periode ini.
                  </p>
                ) : (
                  data.items.map((entry) => (
                    <div
                      key={entry.userId}
                      className="flex items-center gap-4 p-4"
                      data-testid={`admin-leaderboard-row-${entry.rank}`}
                    >
                      <span className="w-8 font-mono font-bold text-jepang-muted">
                        #{entry.rank}
                      </span>
                      <LeaderboardAvatar
                        displayName={entry.displayName}
                        avatarUrl={entry.avatarUrl}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{entry.displayName}</p>
                        <p className="text-xs text-jepang-muted">@{entry.username}</p>
                      </div>
                      <LeaderboardScore
                        periodPoints={entry.periodPoints}
                        totalPoints={entry.totalPoints}
                        period={entry.period}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/profile/${entry.username}`} target="_blank">
                          Profil
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
