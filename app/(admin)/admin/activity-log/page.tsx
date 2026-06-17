"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminPagination from "@/components/admin/AdminPagination";
import { AdminFilterButtons, AdminToolbar } from "@/components/admin/AdminToolbar";
import AdminTrendChart from "@/components/admin/AdminTrendChart";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminAuditEntry } from "@/lib/admin-monitoring";
import type { AnalyticsPeriod } from "@/lib/analytics";

const TYPE_FILTERS = [
  { value: "", label: "Semua" },
  { value: "article_review", label: "Review Artikel" },
  { value: "contributor_review", label: "Kontributor" },
];

const GROWTH_PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "7 hari" },
  { value: "30d", label: "30 hari" },
  { value: "90d", label: "90 hari" },
];

const TYPE_BADGE: Record<string, string> = {
  article_review: "bg-blue-100 text-blue-800",
  contributor_review: "bg-purple-100 text-purple-800",
};

export default function AdminActivityLogPage() {
  const [entries, setEntries] = useState<AdminAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [growthPeriod, setGrowthPeriod] = useState<AnalyticsPeriod>("30d");
  const [growthGranularity, setGrowthGranularity] = useState<"day" | "week">("day");
  const [growth, setGrowth] = useState<{
    series: Array<{ date: string; count: number }>;
    totalUsers: number;
    newInPeriod: number;
  } | null>(null);

  const loadLog = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.set("page", String(page));
      if (type) sp.set("type", type);
      const data = await fetch(`/api/admin/activity-log?${sp}`).then((r) => r.json());
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setTotalPages(Number(data.totalPages || 1));
    } finally {
      setLoading(false);
    }
  }, [page, type]);

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  useEffect(() => {
    fetch(
      `/api/admin/users/growth?period=${growthPeriod}&granularity=${growthGranularity}`,
    )
      .then((r) => r.json())
      .then((json) => setGrowth(json));
  }, [growthPeriod, growthGranularity]);

  return (
    <AdminPageLayout
      testId="admin-activity-log"
      title="Audit Log"
      subtitle="Riwayat persetujuan/penolakan artikel dan kontributor"
    >
      <AdminCard
        title="Pertumbuhan Pengguna"
        variant="panel"
        headerAction={
          <div className="flex flex-wrap gap-2">
            <AdminFilterButtons
              options={GROWTH_PERIODS}
              value={growthPeriod}
              onChange={setGrowthPeriod}
            />
            <Button
              size="sm"
              variant={growthGranularity === "week" ? "default" : "outline"}
              onClick={() =>
                setGrowthGranularity((g) => (g === "day" ? "week" : "day"))
              }
            >
              {growthGranularity === "day" ? "Per Hari" : "Per Minggu"}
            </Button>
          </div>
        }
      >
        {growth && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-jepang-muted">
                  Total Pengguna
                </p>
                <p className="font-mono font-black text-3xl">
                  {growth.totalUsers.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-jepang-muted">
                  Baru di Periode
                </p>
                <p className="font-mono font-black text-3xl">
                  {growth.newInPeriod.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            <AdminTrendChart
              data={growth.series}
              valueLabel="Registrasi"
              color="#171717"
            />
          </div>
        )}
      </AdminCard>

      <AdminToolbar>
        <AdminFilterButtons
          options={TYPE_FILTERS}
          value={type}
          onChange={(value) => {
            setType(value);
            setPage(1);
          }}
        />
      </AdminToolbar>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBox key={i} height="5rem" width="100%" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <AdminCard variant="panel">
          <AdminEmptyState title="Belum ada entri audit log." />
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={TYPE_BADGE[entry.type] ?? ""}>
                        {entry.type === "article_review" ? "Artikel" : "Kontributor"}
                      </Badge>
                      <span className="text-sm font-semibold text-jepang-navy">
                        {entry.action}
                      </span>
                    </div>
                    <p className="text-sm text-jepang-muted">
                      oleh <strong>{entry.actor.name}</strong> (@{entry.actor.username})
                    </p>
                    <p className="text-sm">
                      Target:{" "}
                      {entry.target.href ? (
                        <Link
                          href={entry.target.href}
                          className="text-jepang-orange hover:underline"
                        >
                          {entry.target.label}
                        </Link>
                      ) : (
                        entry.target.label
                      )}
                    </p>
                    {entry.note && (
                      <p className="text-sm text-jepang-muted whitespace-pre-wrap mt-2">
                        Catatan: {entry.note}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-jepang-muted font-mono">
                    {new Date(entry.occurredAt).toLocaleString("id-ID")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </AdminPageLayout>
  );
}
