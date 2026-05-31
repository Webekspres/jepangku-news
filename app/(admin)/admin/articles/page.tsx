"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    { v: "", l: "All" },
    { v: "DRAFT", l: "Draft" },
    { v: "PENDING_REVIEW", l: "Pending" },
    { v: "PUBLISHED", l: "Published" },
    { v: "REJECTED", l: "Rejected" },
    { v: "ARCHIVED", l: "Archived" },
  ];

  return (
    <div className="bg-white min-h-screen" data-testid="admin-articles-page">
      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-4"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="font-heading font-black text-4xl tracking-tighter">
            All Articles
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

        {loading ? (
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted py-12">
            Loading...
          </p>
        ) : (
          <Card className="border border-foreground overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TITLE</TableHead>
                  <TableHead>AUTHOR</TableHead>
                  <TableHead>CATEGORY</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>VIEWS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-jepang-muted py-12"
                    >
                      No articles found
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
                        <Badge
                          variant={STATUS_BADGE[article.status] || "muted"}
                        >
                          {article.status}
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
        )}
      </div>
    </div>
  );
}
