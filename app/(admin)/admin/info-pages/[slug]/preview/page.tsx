"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from "@/lib/fetch-api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import SectionHeader from "@/components/SectionHeader";
import InfoPageSidebar from "@/components/InfoPageSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { isInfoPageSlug, type InfoPageSlug } from "@/lib/info-pages";

type InfoPagePreviewData = {
  slug: InfoPageSlug;
  title: string;
  subtitle: string | null;
  content: string;
  isPublished: boolean;
  updatedAt: string;
};

export default function AdminInfoPagePreview() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const [page, setPage] = useState<InfoPagePreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || !isInfoPageSlug(slug)) {
      router.push("/admin/info-pages");
      return;
    }

    fetch(`/api/admin/info-pages/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return parseApiResponse(r);
      })
      .then(setPage)
      .catch(() => {
        toast.error("Halaman tidak ditemukan");
        router.push("/admin/info-pages");
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  if (!isInfoPageSlug(slug)) return null;

  if (loading) {
    return (
      <div className="p-6 space-y-4" data-testid="admin-info-page-preview-loading">
        <SkeletonBox height="2rem" width="12rem" />
        <SkeletonBox height="8rem" width="100%" />
      </div>
    );
  }

  if (!page) return null;

  return (
    <div data-testid={`admin-info-page-preview-${slug}`}>
      <div className="sticky top-0 z-40 border-b border-amber-300 bg-amber-50 px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Eye size={18} className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-bold text-amber-900">Pratinjau Admin</p>
              <p className="text-xs text-amber-800">
                Tampilan seperti publik — termasuk draft jika belum published.
              </p>
            </div>
            <Badge variant={page.isPublished ? "success" : "warning"}>
              {page.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/info-pages">
                <ArrowLeft size={14} className="mr-1" />
                Daftar
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/admin/info-pages/${slug}/edit`}>
                <Edit size={14} className="mr-1" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <SectionHeader
        label="情報 / INFO"
        title={page.title}
        subtitle={page.subtitle ?? undefined}
        className="border-b border-jepang-border bg-jepang-off-white"
      />

      <div className="px-4 mx-auto max-w-7xl py-12">
        <InfoPageSidebar slug={slug} variant="mobile" />

        <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-0 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div
            className="article-content min-w-0 max-w-3xl lg:max-w-none"
            data-testid="info-page-preview-content"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
          <InfoPageSidebar slug={slug} />
        </div>
      </div>
    </div>
  );
}
