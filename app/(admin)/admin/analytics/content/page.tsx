"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminPageShell from "@/components/admin/AdminPageShell";
import AnalyticsNav from "@/components/admin/AnalyticsNav";
import PeriodSelector from "@/components/admin/PeriodSelector";
import type { AnalyticsPeriod } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { BarChart2 } from "lucide-react";

export default function ContentPerformancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [sort, setSort] = useState<"views" | "bookmarks" | "shares">("views");
  const [rows, setRows] = useState<any[]>([]);
  const [periodLabel, setPeriodLabel] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || (user as any).role !== "ADMIN")) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || (user as any).role !== "ADMIN") return;
    setFetching(true);
    fetch(`/api/admin/analytics/content?period=${period}&sort=${sort}&limit=30`)
      .then((r) => r.json())
      .then((d) => {
        setRows(Array.isArray(d.rows) ? d.rows : []);
        setPeriodLabel(d.periodLabel || "");
      })
      .finally(() => setFetching(false));
  }, [user, period, sort]);

  if (loading || !user || (user as any).role !== "ADMIN") return null;

  return (
    <AdminPageShell
      title="Performa Artikel"
      subtitle={`Peringkat artikel berdasarkan aktivitas dalam periode: ${periodLabel || "..."}. Kolom angka = aktivitas di periode; angka kecil di bawah = total sepanjang waktu.`}
      label="Analytics"
    >
      <AnalyticsNav />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <PeriodSelector value={period} onChange={setPeriod} />
        <div className="flex gap-2">
          {(["views", "bookmarks", "shares"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              className={cn(
                "px-3 py-1 text-xs font-mono uppercase tracking-wider border",
                sort === s
                  ? "border-jepang-red text-jepang-red"
                  : "border-jepang-border text-jepang-muted",
              )}
            >
              {s === "views" ? "Views" : s === "bookmarks" ? "Bookmark" : "Share"}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-jepang-border overflow-x-auto">
        <table className="w-full text-sm" data-testid="content-performance-table">
          <thead className="bg-jepang-off-white border-b border-jepang-border">
            <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-jepang-muted">
              <th className="px-4 py-3">Artikel</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3 text-right">Views</th>
              <th className="px-4 py-3 text-right">Bookmark</th>
              <th className="px-4 py-3 text-right">Share</th>
              <th className="px-4 py-3 text-right">Detail</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-jepang-muted">
                  Memuat...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-jepang-muted">
                  Belum ada data pada periode ini.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-jepang-border last:border-0 hover:bg-jepang-off-white/50">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{r.title}</td>
                  <td className="px-4 py-3 text-jepang-muted">{r.categoryName}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    <div>{r.periodViews}</div>
                    <div className="text-[10px] text-jepang-muted">/{r.lifetimeViews} total</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <div>{r.periodBookmarks}</div>
                    <div className="text-[10px] text-jepang-muted">/{r.lifetimeBookmarks} total</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <div>{r.periodShares}</div>
                    <div className="text-[10px] text-jepang-muted">/{r.lifetimeShares} total</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/analytics/articles/${r.id}?period=${period}`}
                      className="inline-flex items-center gap-1 text-xs font-mono uppercase text-jepang-red hover:underline"
                    >
                      <BarChart2 size={12} /> Grafik
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}
