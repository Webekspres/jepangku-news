"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_BADGE: Record<
  string,
  "success" | "warning" | "red" | "muted" | "black"
> = {
  DRAFT: "muted",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "red",
  ARCHIVED: "muted",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Menunggu Review",
  PUBLISHED: "Dipublikasikan",
  REJECTED: "Ditolak",
  ARCHIVED: "Diarsipkan",
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, [filter]);

  const loadArticles = async () => {
    setLoading(true);

    const url = filter
      ? `/api/admin/articles?status=${filter}`
      : "/api/admin/articles";

    const data = await fetch(url).then((r) => r.json());

    setArticles(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const filters = [
    { v: "", l: "Semua" },
    { v: "DRAFT", l: "Draft" },
    { v: "PENDING_REVIEW", l: "Menunggu Review" },
    { v: "PUBLISHED", l: "Dipublikasikan" },
    { v: "REJECTED", l: "Ditolak" },
    { v: "ARCHIVED", l: "Diarsipkan" },
  ];

  return (
    <div className="bg-white min-h-screen" data-testid="admin-articles-page">
      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-4"
          >
            <ArrowLeft size={14} /> Kembali ke Dashboard
          </Link>

          <h1 className="font-heading font-black text-4xl tracking-tighter">
            Semua Artikel
          </h1>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((s) => (
            <Button
              key={s.v}
              size="sm"
              variant={filter === s.v ? "black" : "outline"}
              onClick={() => setFilter(s.v)}
              data-testid={`admin-filter-${s.v || "all"}`}
            >
              {s.l}
            </Button>
          ))}
        </div>

        <Card className="border border-foreground overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>JUDUL</TableHead>
                <TableHead>PENULIS</TableHead>
                <TableHead>KATEGORI</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>DILIHAT</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && articles.length === 0 ? (
                [1, 2, 3].map((r) => (
                  <TableRow key={r}>
                    <TableCell>
                      <SkeletonBox height="1rem" width="70%" />
                    </TableCell>

                    <TableCell>
                      <SkeletonBox height="0.9rem" width="40%" />
                    </TableCell>

                    <TableCell>
                      <SkeletonBox height="0.9rem" width="40%" />
                    </TableCell>

                    <TableCell>
                      <SkeletonBox height="0.9rem" width="30%" />
                    </TableCell>

                    <TableCell>
                      <SkeletonBox height="0.9rem" width="20%" />
                    </TableCell>
                  </TableRow>
                ))
              ) : articles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-jepang-muted py-12"
                  >
                    Tidak ada artikel ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article: any) => (
                  <TableRow
                    key={article.id}
                    data-testid={`admin-article-row-${article.id}`}
                  >
                    <TableCell className="font-semibold max-w-xs truncate">
                      {article.title}
                    </TableCell>

                    <TableCell className="text-jepang-muted">
                      {article.author?.name || "-"}
                    </TableCell>

                    <TableCell className="text-jepang-muted">
                      {article.category?.name || "-"}
                    </TableCell>

                    <TableCell>
                      <Badge variant={STATUS_BADGE[article.status] || "muted"}>
                        {STATUS_LABEL[article.status] || article.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono">
                      {article.viewCount || 0}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
