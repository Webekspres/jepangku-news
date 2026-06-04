"use client";
export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Download,
  CheckSquare,
  Archive,
  XCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

function buildQuery(params: Record<string, string>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const { confirm, confirmProps } = useConfirm();

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [sort, setSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryString = buildQuery({
    status: statusFilter,
    categoryId: categoryFilter,
    authorId: authorFilter,
    sort,
    search,
    dateFrom,
    dateTo,
  });

  const loadArticles = useCallback(async () => {
    setLoading(true);
    const data = await fetch(`/api/admin/articles${queryString}`).then((r) =>
      r.json(),
    );
    const list = Array.isArray(data) ? data : [];
    setArticles(list);

    const authorMap = new Map<string, string>();
    list.forEach((a: any) => {
      if (a.author?.id) {
        authorMap.set(a.author.id, a.author.name || a.author.username || a.author.id);
      }
    });
    setAuthors(
      Array.from(authorMap.entries()).map(([id, name]) => ({ id, name })),
    );
    setSelected(new Set());
    setLoading(false);
  }, [queryString]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []));
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === articles.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(articles.map((a) => a.id)));
    }
  };

  const runBulk = (
    action: "approve" | "reject" | "archive" | "delete",
    options?: { note?: string; confirmMessage?: string },
  ) => {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      toast.error("Pilih minimal satu artikel");
      return;
    }

    confirm({
      title:
        action === "delete"
          ? "Hapus artikel?"
          : action === "archive"
            ? "Arsipkan artikel?"
            : action === "approve"
              ? "Setujui artikel?"
              : "Tolak artikel?",
      description:
        options?.confirmMessage ||
        `${ids.length} artikel akan diproses.`,
      confirmLabel: action === "delete" ? "Hapus" : "Lanjutkan",
      variant: action === "delete" ? "danger" : "warning",
      onConfirm: async () => {
        setBulkLoading(true);
        try {
          const res = await fetch("/api/admin/articles/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids, action, note: options?.note }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Bulk action failed");
          toast.success(`${data.succeeded} dari ${data.processed} artikel berhasil`);
          await loadArticles();
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : "Gagal memproses bulk");
        } finally {
          setBulkLoading(false);
        }
      },
    });
  };

  const handleExport = (format: "csv" | "json") => {
    window.open(`/api/admin/articles/export${queryString}${queryString ? "&" : "?"}format=${format}`, "_blank");
  };

  const statusFilters = [
    { v: "", l: "Semua" },
    { v: "DRAFT", l: "Draft" },
    { v: "PENDING_REVIEW", l: "Review" },
    { v: "PUBLISHED", l: "Published" },
    { v: "REJECTED", l: "Ditolak" },
    { v: "ARCHIVED", l: "Arsip" },
  ];

  return (
    <div className="bg-white min-h-screen" data-testid="admin-articles-page">
      <ConfirmModal {...confirmProps} />

      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-4"
          >
            <ArrowLeft size={14} /> Kembali ke Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h1 className="font-heading font-black text-4xl tracking-tighter">
              Semua Artikel
            </h1>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("csv")} data-testid="export-csv">
                <Download size={14} className="mr-1" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("json")} data-testid="export-json">
                <Download size={14} className="mr-1" /> JSON
              </Button>
              <Button asChild data-testid="create-article-btn">
                <Link href="/admin/articles/create">
                  <Plus size={14} className="mr-1" /> Buat Artikel
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8 space-y-6">
        <Card className="border border-foreground p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((s) => (
              <Button
                key={s.v}
                size="sm"
                variant={statusFilter === s.v ? "black" : "outline"}
                onClick={() => setStatusFilter(s.v)}
              >
                {s.l}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider">Cari judul</Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Judul atau ringkasan..."
                data-testid="admin-article-search"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider">Kategori</Label>
              <Select
                value={categoryFilter || "_all"}
                onValueChange={(v) => setCategoryFilter(v === "_all" ? "" : v)}
              >
                <SelectTrigger data-testid="filter-category">
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Semua kategori</SelectItem>
                  {categories.map((c: { id: string; name: string }) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider">Penulis</Label>
              <Select
                value={authorFilter || "_all"}
                onValueChange={(v) => setAuthorFilter(v === "_all" ? "" : v)}
              >
                <SelectTrigger data-testid="filter-author">
                  <SelectValue placeholder="Semua penulis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Semua penulis</SelectItem>
                  {authors.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider">Urutkan</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger data-testid="filter-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Terbaru dibuat</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                  <SelectItem value="popular">Paling dilihat</SelectItem>
                  <SelectItem value="published">Terbaru publish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider">Dari tanggal</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                data-testid="filter-date-from"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider">Sampai tanggal</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                data-testid="filter-date-to"
              />
            </div>
            <div className="flex items-end">
              <Button variant="black" onClick={loadArticles} data-testid="apply-filters">
                Terapkan Filter
              </Button>
            </div>
          </div>
        </Card>

        {selected.size > 0 && (
          <div className="flex flex-wrap gap-2 p-4 border border-foreground bg-jepang-off-white">
            <span className="text-sm font-semibold self-center mr-2">
              {selected.size} dipilih
            </span>
            <Button
              size="sm"
              onClick={() => runBulk("approve")}
              disabled={bulkLoading}
              data-testid="bulk-approve"
            >
              <CheckSquare size={14} className="mr-1" /> Setujui
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => runBulk("reject", { note: "Bulk rejected" })}
              disabled={bulkLoading}
              data-testid="bulk-reject"
            >
              <XCircle size={14} className="mr-1" /> Tolak
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => runBulk("archive")}
              disabled={bulkLoading}
              data-testid="bulk-archive"
            >
              <Archive size={14} className="mr-1" /> Arsipkan
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-jepang-red border-jepang-red hover:bg-jepang-red hover:text-white"
              onClick={() =>
                runBulk("delete", {
                  confirmMessage:
                    "Artikel akan dihapus permanen beserta bookmark terkait. Poin pembaca yang sudah ada tidak dicabut.",
                })
              }
              disabled={bulkLoading}
              data-testid="bulk-delete"
            >
              <Trash2 size={14} className="mr-1" /> Hapus
            </Button>
          </div>
        )}

        <Card className="border border-foreground overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={articles.length > 0 && selected.size === articles.length}
                    onChange={toggleAll}
                    aria-label="Pilih semua"
                    data-testid="select-all-articles"
                  />
                </TableHead>
                <TableHead>JUDUL</TableHead>
                <TableHead>PENULIS</TableHead>
                <TableHead>KATEGORI</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>DILIHAT</TableHead>
                <TableHead className="text-right">AKSI</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && articles.length === 0 ? (
                [1, 2, 3].map((r) => (
                  <TableRow key={r}>
                    <TableCell colSpan={7}>
                      <SkeletonBox height="1rem" width="100%" />
                    </TableCell>
                  </TableRow>
                ))
              ) : articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-jepang-muted py-12">
                    Tidak ada artikel ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article: any) => (
                  <TableRow
                    key={article.id}
                    data-testid={`admin-article-row-${article.id}`}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(article.id)}
                        onChange={() => toggleSelect(article.id)}
                        aria-label={`Pilih ${article.title}`}
                      />
                    </TableCell>
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
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          data-testid={`edit-article-${article.id}`}
                        >
                          <Pencil size={14} className="mr-1" /> Edit
                        </Link>
                      </Button>
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
