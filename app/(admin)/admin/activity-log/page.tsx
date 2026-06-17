"use client";
export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
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
    <div className="w-full px-4 py-8 lg:px-6" data-testid="admin-activity-log">
      <SectionHeader
        label="管理 / ADMIN"
        title="Audit Log"
        subtitle="Riwayat persetujuan/penolakan artikel dan kontributor"
        className="border-b border-jepang-border bg-jepang-navy text-white"
        fullWidth
      />

      <div className="py-8 space-y-8">
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading font-bold text-lg">Pertumbuhan Pengguna</h2>
              <div className="flex flex-wrap gap-2">
                {GROWTH_PERIODS.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={growthPeriod === option.value ? "default" : "outline"}
                    onClick={() => setGrowthPeriod(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
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
            </div>
            {growth && (
              <>
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
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((filter) => (
            <Button
              key={filter.value || "all"}
              size="sm"
              variant={type === filter.value ? "default" : "outline"}
              onClick={() => {
                setType(filter.value);
                setPage(1);
              }}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} height="5rem" width="100%" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-jepang-muted">
              Belum ada entri audit log.
            </CardContent>
          </Card>
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <span className="text-xs text-jepang-muted">
              Halaman {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
