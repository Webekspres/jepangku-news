"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { AdminFilterButtons, AdminToolbar } from "@/components/admin/AdminToolbar";
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
      .then((r) => parseApiResponse(r))
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <AdminPageLayout
      testId="admin-leaderboard"
      title="Monitor Leaderboard"
      subtitle="Pantau peringkat poin pengguna per periode"
      headerActions={
        <Button size="sm" variant="outline" asChild>
          <Link href="/leaderboard" target="_blank">
            Lihat Publik
          </Link>
        </Button>
      }
    >
      <AdminToolbar>
        <AdminFilterButtons
          options={PERIODS.map((value) => ({
            value,
            label: LEADERBOARD_PERIOD_SHORT[value],
          }))}
          value={period}
          onChange={setPeriod}
        />
      </AdminToolbar>

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

          <AdminCard variant="panel" noPadding>
            {data.items.length === 0 ? (
              <p className="p-8 text-center text-sm text-jepang-muted">
                Belum ada data leaderboard untuk periode ini.
              </p>
            ) : (
              <div className="divide-y divide-jepang-border">
                {data.items.map((entry) => (
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
                ))}
              </div>
            )}
          </AdminCard>
        </>
      ) : null}
    </AdminPageLayout>
  );
}
