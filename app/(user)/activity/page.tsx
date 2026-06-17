"use client";

import { useEffect, useState } from "react";
import { useAuth, isAuthUser } from "@/contexts/AuthContext";
import { Award } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LeaderboardRowSkeleton from "@/components/skeletons/LeaderboardRowSkeleton";
import { getActivityIcon, getActivityLabel } from "@/lib/activity-labels";

export default function UserActivityPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<
    Array<{
      id: string;
      activityType: string;
      points: number;
      description: string | null;
      occurredAt: string;
    }>
  >([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/points/my")
      .then((r) => r.json())
      .then((d) => {
        setTransactions(Array.isArray(d?.transactions) ? d.transactions : []);
        setTotalPoints(Number(d?.totalPoints ?? 0));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen" data-testid="activity-page">
      <section className="border-b border-jepang-border bg-jepang-navy text-white">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-2 opacity-80">
            活動 / AKTIVITAS
          </p>
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <h1 className="font-heading font-black text-4xl tracking-tighter">
              Riwayat Aktivitas
            </h1>
            <div className="text-right">
              <p className="font-mono font-black text-5xl md:text-6xl">
                {isAuthUser(user) ? user.totalPoints : totalPoints}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
                Total Poin
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-12">
        {loading ? (
          <Card className="border border-foreground">
            <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                Transaksi Terbaru
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-jepang-border">
                {[1, 2, 3, 4].map((i) => (
                  <LeaderboardRowSkeleton key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : transactions.length > 0 ? (
          <Card className="border border-foreground">
            <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                Transaksi Terbaru
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-jepang-border">
                {transactions.map((t, idx) => {
                  const Icon = getActivityIcon(t.activityType);
                  const label = getActivityLabel(t.activityType, t.description);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-4 p-4"
                      data-testid={`activity-row-${idx}`}
                    >
                      <div className="w-10 h-10 bg-jepang-off-white border border-jepang-border flex items-center justify-center">
                        <Icon size={18} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
                          {new Date(t.occurredAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-mono font-black text-lg text-jepang-red">
                        +{t.points}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-24" data-testid="activity-empty">
            <Award
              size={48}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-jepang-muted"
            />
            <p className="font-heading font-bold text-2xl mb-2">Belum ada aktivitas</p>
            <p className="text-jepang-muted">
              Baca artikel dan ikuti kuis untuk mengumpulkan poin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
