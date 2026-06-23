"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminPageShell from "@/components/admin/AdminPageShell";
import SimpleBarChart from "@/components/admin/SimpleBarChart";

export default function CategoryAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || (user as any).role !== "ADMIN")) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || (user as any).role !== "ADMIN") return;
    fetch("/api/admin/analytics/categories")
      .then((r) => parseApiResponse(r))
      .then((d) => setCategories(Array.isArray(d.categories) ? d.categories : []))
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user || (user as any).role !== "ADMIN") return null;

  return (
    <AdminPageShell
      title="Statistik per Kategori"
      subtitle="Agregat lifetime artikel published per kategori. Engagement = bookmark + share yang tercatat pada artikel di kategori tersebut."
      label="Analytics"
      backHref="/admin/analytics"
      backLabel="Kembali ke Ringkasan Analytics"
    >

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="border border-jepang-border p-5">
          <h2 className="font-heading font-bold text-lg mb-4">Views per Kategori</h2>
          <SimpleBarChart
            data={categories.map((c) => ({ label: c.name, value: c.totalViews }))}
            valueLabel="Total views (lifetime)"
          />
        </div>
        <div className="border border-jepang-border p-5">
          <h2 className="font-heading font-bold text-lg mb-4">Engagement per Kategori</h2>
          <SimpleBarChart
            data={categories.map((c) => ({ label: c.name, value: c.engagement }))}
            valueLabel="Bookmark + share (lifetime)"
          />
        </div>
      </div>

      <div className="border border-jepang-border overflow-x-auto">
        <table className="w-full text-sm" data-testid="category-analytics-table">
          <thead className="bg-jepang-off-white border-b border-jepang-border">
            <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-jepang-muted">
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3 text-right">Artikel</th>
              <th className="px-4 py-3 text-right">Views</th>
              <th className="px-4 py-3 text-right">Bookmark</th>
              <th className="px-4 py-3 text-right">Share</th>
              <th className="px-4 py-3 text-right">Engagement</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-jepang-muted">Memuat...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-jepang-muted">Belum ada kategori.</td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="border-b border-jepang-border last:border-0">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-right font-mono">{c.articleCount}</td>
                  <td className="px-4 py-3 text-right font-mono">{c.totalViews}</td>
                  <td className="px-4 py-3 text-right font-mono">{c.totalBookmarks}</td>
                  <td className="px-4 py-3 text-right font-mono">{c.totalShares}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-jepang-red">{c.engagement}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}
