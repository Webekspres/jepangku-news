"use client";

import { useEffect, useState } from "react";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { AdminFilterButtons, AdminToolbar } from "@/components/admin/AdminToolbar";
import AdminTrendChart from "@/components/admin/AdminTrendChart";
import PointTransactionDetailModal from "@/components/admin/PointTransactionDetailModal";
import SimpleBarChart from "@/components/admin/SimpleBarChart";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminPointTransaction } from "@/lib/admin/point-transactions";
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
  recentTransactions: AdminPointTransaction[];
};

export default function AdminPointsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [data, setData] = useState<PointsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<AdminPointTransaction | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/points?period=${period}`)
      .then((r) => r.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <AdminPageLayout
      testId="admin-points"
      title="Transaksi Poin"
      subtitle="Ringkasan poin yang diaward ke pengguna"
    >
      <AdminToolbar>
        <AdminFilterButtons
          options={PERIODS}
          value={period}
          onChange={setPeriod}
        />
      </AdminToolbar>

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
            <AdminCard title="Poin per Hari" variant="panel">
              <AdminTrendChart
                data={data.pointsByDay}
                valueLabel="Poin"
                color="#c41e3a"
              />
            </AdminCard>
            <AdminCard title="Breakdown Tipe Aktivitas" variant="panel">
              <SimpleBarChart
                data={data.breakdown.map((row) => ({
                  label: row.label,
                  value: row.totalPoints,
                  subLabel: `${row.count}×`,
                }))}
                valueLabel="Total poin"
              />
            </AdminCard>
          </div>

          <AdminCard title="Transaksi Terbaru" variant="panel" noPadding>
            {data.recentTransactions.length === 0 ? (
              <p className="p-8 text-center text-sm text-jepang-muted">
                Belum ada transaksi pada periode ini.
              </p>
            ) : (
              <div className="divide-y divide-jepang-border">
                {data.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 p-4 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{tx.activityLabel}</p>
                      <p className="text-xs text-jepang-muted truncate">
                        {tx.source.label} · {tx.user.name} ·{" "}
                        {new Date(tx.occurredAt).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <p className="font-mono font-bold text-jepang-red shrink-0">
                      +{tx.points}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setSelectedTx(tx)}
                      data-testid={`point-tx-detail-${tx.id}`}
                    >
                      Detail
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </>
      ) : null}

      <PointTransactionDetailModal
        transaction={selectedTx}
        open={selectedTx !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTx(null);
        }}
      />
    </AdminPageLayout>
  );
}
