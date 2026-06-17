"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import AdminTrendChart from "@/components/admin/AdminTrendChart";
import SimpleBarChart from "@/components/admin/SimpleBarChart";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getActivityLabel } from "@/lib/activity-labels";
import type { AnalyticsPeriod } from "@/lib/analytics";

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "7 hari" },
  { value: "30d", label: "30 hari" },
  { value: "90d", label: "90 hari" },
  { value: "all", label: "Semua" },
];

type PointsSummary = {
  period: AnalyticsPeriod;
  totalPoints: number;
  transactionCount: number;
  breakdown: Array<{
    activityType: string;
    label: string;
    totalPoints: number;
    count: number;
  }>;
  pointsByDay: Array<{ date: string; count: number }>;
  recentTransactions: Array<{
    id: string;
    activityType: string;
    points: number;
    description: string | null;
    occurredAt: string;
    user: { id: string; name: string; username: string };
  }>;
};

export default function AdminPointsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [data, setData] = useState<PointsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/points?period=${period}`)
      .then((r) => r.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="w-full px-4 py-8 lg:px-6" data-testid="admin-points">
      <SectionHeader
        label="管理 / ADMIN"
        title="Transaksi Poin"
        subtitle="Ringkasan poin yang diaward ke pengguna"
        className="border-b border-jepang-border bg-jepang-navy text-white"
        fullWidth
      />

      <div className="py-8 space-y-6">
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={period === option.value ? "default" : "outline"}
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <SkeletonBox height="24rem" width="100%" />
        ) : data ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-wider text-jepang-muted">
                    Total Poin Diaward
                  </p>
                  <p className="font-mono font-black text-4xl mt-2">
                    {data.totalPoints.toLocaleString("id-ID")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-wider text-jepang-muted">
                    Jumlah Transaksi
                  </p>
                  <p className="font-mono font-black text-4xl mt-2">
                    {data.transactionCount.toLocaleString("id-ID")}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardContent className="p-5">
                  <h2 className="font-heading font-bold text-lg mb-4">Poin per Hari</h2>
                  <AdminTrendChart
                    data={data.pointsByDay}
                    valueLabel="Poin"
                    color="#c41e3a"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <h2 className="font-heading font-bold text-lg mb-4">Breakdown Tipe Aktivitas</h2>
                  <SimpleBarChart
                    data={data.breakdown.map((row) => ({
                      label: row.label,
                      value: row.totalPoints,
                      subLabel: `${row.count}×`,
                    }))}
                    valueLabel="Total poin"
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0 divide-y divide-jepang-border">
                <div className="px-5 py-4 border-b border-jepang-border">
                  <h2 className="font-heading font-bold text-lg">Transaksi Terbaru</h2>
                </div>
                {data.recentTransactions.length === 0 ? (
                  <p className="p-8 text-center text-sm text-jepang-muted">
                    Belum ada transaksi pada periode ini.
                  </p>
                ) : (
                  data.recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-4 p-4 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">
                          {getActivityLabel(tx.activityType, tx.description)}
                        </p>
                        <p className="text-xs text-jepang-muted">
                          {tx.user.name} · @{tx.user.username} ·{" "}
                          {new Date(tx.occurredAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-mono font-bold text-jepang-red">+{tx.points}</p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/users`}>User</Link>
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
