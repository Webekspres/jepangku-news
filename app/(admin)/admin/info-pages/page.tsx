"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Pencil, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import SectionHeader from "@/components/SectionHeader";
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

  useEffect(() => {
    fetch("/api/admin/info-pages")
      .then((r) => r.json())
      .then((data) => setPages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="admin-info-pages">
      <SectionHeader
        label="管理 / ADMIN"
        title="Halaman Informasi"
        subtitle="Kelola konten halaman About, Contact, Privacy Policy, dan lainnya"
        className="border-b-2 border-foreground bg-foreground text-white"
      />

      <div className="px-4 mx-auto max-w-7xl py-12">
        <Button variant="outline" asChild className="mb-8">
          <Link href="/admin">
            <ArrowLeft size={14} strokeWidth={1.5} className="mr-1" />
            Kembali ke Dashboard
          </Link>
        </Button>

        <div className="border border-jepang-border bg-white">
          <div className="px-5 py-4 border-b border-jepang-border flex items-center gap-3">
            <FileText size={18} strokeWidth={1.5} />
            <p className="font-heading font-bold text-lg">9 Halaman Informasi</p>
          </div>

          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonBox key={i} height="3rem" width="100%" />
              ))}
            </div>
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
        </div>

        {!loading && pages.length === 0 && (
          <p className="text-sm text-jepang-muted mt-4">
            Belum ada halaman. Jalankan seed database untuk mengisi konten awal.
          </p>
        )}

        {!loading && pages.length > 0 && (
          <p className="text-xs text-jepang-muted mt-6">
            Label: {INFO_PAGE_LABELS.about}, {INFO_PAGE_LABELS.contact}, dan
            seterusnya — slug halaman tidak dapat diubah.
          </p>
        )}
      </div>
    </div>
  );
}
