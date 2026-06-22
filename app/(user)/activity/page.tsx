"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, isAuthUser } from "@/contexts/AuthContext";
import { Award, Download } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LeaderboardRowSkeleton from "@/components/skeletons/LeaderboardRowSkeleton";
import { getActivityIcon, getActivityLabel } from "@/lib/activity-labels";
import type { ActivityFeedItem } from "@/lib/activity/feed";

type PointRow = {
  id: string;
  activityType: string;
  points: number;
  description: string | null;
  occurredAt: string;
};

type TabId = "all" | "points";

export default function UserActivityPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabId>("all");
  const [transactions, setTransactions] = useState<PointRow[]>([]);
  const [feedItems, setFeedItems] = useState<ActivityFeedItem[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/points/my").then((r) => r.json()),
      fetch("/api/activity/feed").then((r) => r.json()),
    ])
      .then(([pointsData, feedData]) => {
        setTransactions(Array.isArray(pointsData?.transactions) ? pointsData.transactions : []);
        setTotalPoints(Number(pointsData?.totalPoints ?? 0));
        setFeedItems(Array.isArray(feedData?.items) ? feedData.items : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const exportCsv = () => {
    window.location.href = "/api/points/export";
  };

  const feedIcon = (kind: ActivityFeedItem["kind"]) => {
    if (kind === "points") return getActivityIcon("daily_login");
    if (kind === "comment") return getActivityIcon("comment_created");
    if (kind === "quiz") return getActivityIcon("quiz_completed");
    if (kind === "poll") return getActivityIcon("poll_voted");
    if (kind === "bookmark") return getActivityIcon("article_bookmarked");
    if (kind === "share") return getActivityIcon("article_shared");
    return getActivityIcon("daily_login");
  };

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

      <div className="px-4 mx-auto max-w-7xl py-12 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={tab === "all" ? "default" : "outline"}
              onClick={() => setTab("all")}
              data-testid="activity-tab-all"
            >
              Semua aktivitas
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tab === "points" ? "default" : "outline"}
              onClick={() => setTab("points")}
              data-testid="activity-tab-points"
            >
              Ledger poin
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={exportCsv}
            data-testid="activity-export-csv"
          >
            <Download size={14} aria-hidden />
            Export CSV poin
          </Button>
        </div>

        {loading ? (
          <Card className="border border-foreground">
            <CardContent className="p-0">
              <div className="divide-y divide-jepang-border">
                {[1, 2, 3, 4].map((i) => (
                  <LeaderboardRowSkeleton key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : tab === "points" ? (
          transactions.length > 0 ? (
            <Card className="border border-foreground">
              <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Transaksi Poin
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
            <EmptyState />
          )
        ) : feedItems.length > 0 ? (
          <Card className="border border-foreground">
            <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                Timeline Aktivitas
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-jepang-border">
                {feedItems.map((item, idx) => {
                  const Icon = feedIcon(item.kind);
                  const inner = (
                    <>
                      <div className="w-10 h-10 bg-jepang-off-white border border-jepang-border flex items-center justify-center shrink-0">
                        <Icon size={18} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{item.label}</p>
                        <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
                          {new Date(item.occurredAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                      {item.points != null ? (
                        <p className="font-mono font-black text-lg text-jepang-red shrink-0">
                          +{item.points}
                        </p>
                      ) : null}
                    </>
                  );

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4"
                      data-testid={`activity-feed-row-${idx}`}
                    >
                      {item.href ? (
                        <Link href={item.href} className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80">
                          {inner}
                        </Link>
                      ) : (
                        inner
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24" data-testid="activity-empty">
      <Award
        size={48}
        strokeWidth={1.5}
        className="mx-auto mb-4 text-jepang-muted"
      />
      <p className="font-heading font-bold text-2xl mb-2">Belum ada aktivitas</p>
      <p className="text-jepang-muted">
        Baca artikel, ikuti kuis, dan berinteraksi untuk mengisi riwayat Anda.
      </p>
    </div>
  );
}
