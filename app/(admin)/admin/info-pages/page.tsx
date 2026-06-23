"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import { Pencil, ExternalLink, FileText, Eye } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminStatCards from "@/components/admin/AdminStatCards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { INFO_PAGE_LABELS, type InfoPageSlug } from "@/lib/info-pages";

type InfoPageListItem = {
  id: string;
  slug: InfoPageSlug;
  title: string;
  subtitle: string | null;
  isPublished: boolean;
  sortOrder: number;
  updatedAt: string;
  updatedByName: string | null;
};

export default function AdminInfoPagesPage() {
  const [pages, setPages] = useState<InfoPageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ total: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/info-pages/stats")
      .then((r) => parseApiResponse(r))
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/info-pages")
      .then((r) => parseApiResponse(r))
      .then((data) => setPages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPageLayout
      testId="admin-info-pages"
      title="Halaman Informasi"
      subtitle="Kelola konten halaman About, Contact, Privacy Policy, dan lainnya"
    >
      <AdminStatCards
        loading={statsLoading}
        skeletonCount={1}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        items={[
          {
            label: "Total Halaman",
            value: stats?.total ?? 0,
            icon: FileText,
            testId: "stat-total-halaman",
          },
        ]}
      />
      <AdminCard title={`${stats?.total ?? pages.length} Halaman Informasi`} variant="list" noPadding>
        {loading ? (
          <div className="space-y-4 p-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonBox key={i} height="3rem" width="100%" />
            ))}
          </div>
        ) : pages.length === 0 ? (
          <AdminEmptyState title="Belum ada halaman. Jalankan seed database untuk mengisi konten awal." />
        ) : (
          <div className="divide-y divide-jepang-border">
            {pages.map((page) => (
              <div
                key={page.id}
                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
                data-testid={`info-page-row-${page.slug}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-heading font-bold">{page.title}</p>
                    <Badge variant={page.isPublished ? "success" : "muted"}>
                      {page.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-jepang-muted mt-1">
                    /{page.slug}
                    {page.subtitle ? ` · ${page.subtitle}` : ""}
                  </p>
                  {page.updatedByName && (
                    <p className="text-xs text-jepang-muted mt-1">
                      Terakhir diedit oleh {page.updatedByName} ·{" "}
                      {new Date(page.updatedAt).toLocaleDateString("id-ID")}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/info-pages/${page.slug}/preview`}>
                      <Eye size={14} strokeWidth={1.5} className="mr-1" />
                      Preview
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/${page.slug}`} target="_blank">
                      <ExternalLink size={14} strokeWidth={1.5} className="mr-1" />
                      Lihat
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/admin/info-pages/${page.slug}/edit`}>
                      <Pencil size={14} strokeWidth={1.5} className="mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {!loading && pages.length > 0 && (
        <p className="text-xs text-jepang-muted">
          Label: {INFO_PAGE_LABELS.about}, {INFO_PAGE_LABELS.contact}, dan
          seterusnya — slug halaman tidak dapat diubah.
        </p>
      )}
    </AdminPageLayout>
  );
}
