"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminPageShell from "@/components/admin/AdminPageShell";
import PeriodSelector from "@/components/admin/PeriodSelector";
import SimpleBarChart from "@/components/admin/SimpleBarChart";
import type { AnalyticsPeriod } from "@/lib/analytics";

function ArticleAnalyticsContent() {
  const { id } = useParams<{ id: string }>()!;
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState<AnalyticsPeriod>(
    (searchParams?.get("period") as AnalyticsPeriod) || "30d",
  );
  const [data, setData] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || (user as any).role !== "ADMIN")) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || (user as any).role !== "ADMIN") return;
    setFetching(true);
    fetch(`/api/admin/analytics/articles/${id}?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setFetching(false));
  }, [user, id, period]);

  if (loading || !user || (user as any).role !== "ADMIN") return null;

  const article = data?.article;

  return (
    <AdminPageShell
      title={article ? `Views: ${article.title}` : "Analytics Artikel"}
      subtitle={
        data?.periodLabel
          ? `Periode: ${data.periodLabel}. Total views = semua kunjungan halaman. Unique visitors = pengunjung unik (user login atau anonim terpisah).`
          : undefined
      }
      label="Analytics"
      backHref="/admin/analytics/content"
      backLabel="Kembali ke Performa Artikel"
    >

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PeriodSelector value={period} onChange={setPeriod} />
        {article?.slug && (
          <Link
            href={`/articles/${article.slug}`}
            className="text-xs font-mono uppercase text-jepang-red hover:underline"
            target="_blank"
          >
            Lihat artikel publik →
          </Link>
        )}
      </div>

      {fetching ? (
        <p className="text-jepang-muted py-12 text-center">Memuat...</p>
      ) : !article ? (
        <p className="text-jepang-muted py-12 text-center">Artikel tidak ditemukan.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="border border-jepang-border p-4 text-center">
              <p className="text-[10px] font-mono uppercase text-jepang-muted">Total Views (periode)</p>
              <p className="font-mono font-black text-3xl mt-1">{data.totalViews}</p>
            </div>
            <div className="border border-jepang-border p-4 text-center">
              <p className="text-[10px] font-mono uppercase text-jepang-muted">Unique Visitors</p>
              <p className="font-mono font-black text-3xl mt-1 text-jepang-red">{data.uniqueVisitors}</p>
            </div>
            <div className="border border-jepang-border p-4 text-center">
              <p className="text-[10px] font-mono uppercase text-jepang-muted">Views Lifetime</p>
              <p className="font-mono font-black text-3xl mt-1">{data.lifetimeViews}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-jepang-border p-5">
              <h2 className="font-heading font-bold text-lg mb-1">Views per Hari</h2>
              <p className="text-xs text-jepang-muted mb-4">Total kunjungan per tanggal</p>
              <SimpleBarChart
                data={(data.series || []).map((s: any) => ({
                  label: s.date.slice(5),
                  value: s.totalViews,
                }))}
                valueLabel="Views harian"
              />
            </div>
            <div className="border border-jepang-border p-5">
              <h2 className="font-heading font-bold text-lg mb-1">Unique Visitors per Hari</h2>
              <p className="text-xs text-jepang-muted mb-4">Pengunjung unik per tanggal</p>
              <SimpleBarChart
                data={(data.series || []).map((s: any) => ({
                  label: s.date.slice(5),
                  value: s.uniqueVisitors,
                }))}
                valueLabel="Unik harian"
              />
            </div>
          </div>
        </>
      )}
    </AdminPageShell>
  );
}

export default function ArticleAnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-jepang-muted">Memuat...</div>}>
      <ArticleAnalyticsContent />
    </Suspense>
  );
}
