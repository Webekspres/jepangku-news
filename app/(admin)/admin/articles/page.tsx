"use client";
export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Download,
  CheckSquare,
  Archive,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  FileText,
  Eye,
  Search,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import AdminStatCards from "@/components/admin/AdminStatCards";
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
  DRAFT: "Draf",
  PENDING_REVIEW: "Menunggu Review",
  PUBLISHED: "Dipublikasikan",
  REJECTED: "Ditolak",
  ARCHIVED: "Diarsipkan",
};

type RejectTarget =
  | { mode: "single"; id: string; title: string }
  | { mode: "bulk"; count: number };

function RejectArticleModal({
  open,
  onOpenChange,
  target,
  note,
  onNoteChange,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: RejectTarget | null;
  note: string;
  onNoteChange: (value: string) => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const description =
    target?.mode === "single"
      ? `"${target.title}" akan ditolak. Penulis dapat memperbaiki dan mengirim ulang dari halaman artikel saya.`
      : target?.mode === "bulk"
        ? `${target.count} artikel akan ditolak.`
        : "";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-lg border border-jepang-border bg-white p-6 shadow-jepang-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "duration-200",
          )}
          onInteractOutside={() => !loading && onOpenChange(false)}
          onEscapeKeyDown={() => !loading && onOpenChange(false)}
        >
          <div className="mb-4 text-amber-500">
            <XCircle size={28} strokeWidth={1.5} />
          </div>
          <DialogPrimitive.Title className="font-heading font-black text-xl tracking-tight mb-1">
            Tolak artikel?
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="text-sm text-jepang-muted mb-4">
              {description}
            </DialogPrimitive.Description>
          )}
          <div className="space-y-2 mb-5">
            <Label htmlFor="reject-note-modal">Catatan Penolakan (wajib)</Label>
            <Textarea
              id="reject-note-modal"
              rows={3}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Jelaskan alasan artikel ini ditolak..."
              data-testid="reject-note-input"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={cn(
                "flex-1 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors disabled:opacity-60",
                "border border-amber-500 bg-amber-500 text-white hover:bg-amber-600 hover:border-amber-600 cursor-pointer",
              )}
              data-testid="reject-modal-confirm"
            >
              {loading ? "Memproses..." : "Tolak"}
            </button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="reject-modal-cancel"
            >
              Batal
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function buildQuery(params: Record<string, string>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

type ArticleStats = {
  total: number;
  pendingReview: number;
  published: number;
  rejected: number;
  archived: number;
  totalViews: number;
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<ArticleStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const PER_PAGE = 20;
  const { confirm, confirmProps } = useConfirm();

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const filterQueryString = buildQuery({
    status: statusFilter,
    categoryId: categoryFilter,
    sort,
    search,
  });

  const queryString = buildQuery({
    status: statusFilter,
    categoryId: categoryFilter,
    sort,
    search,
    page: String(page),
    limit: String(PER_PAGE),
  });

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await fetch("/api/admin/articles/stats").then((r) => r.json());
      setStats(data);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    const data = await fetch(`/api/admin/articles${queryString}`).then((r) =>
      r.json(),
    );
    const list = Array.isArray(data?.articles)
      ? data.articles
      : Array.isArray(data)
        ? data
        : [];
    setArticles(list);
    setPage(Number(data?.page || page));
    setTotalPages(Number(data?.totalPages || 1));
    setTotalItems(Number(data?.total || list.length));
    setSelected(new Set());
    setLoading(false);
  }, [queryString]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []));
  }, []);

  const applyStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const articleStatItems = [
    {
      label: "Total Artikel",
      value: stats?.total ?? 0,
      icon: FileText,
      onClick: () => applyStatusFilter(""),
      testId: "stat-total-artikel",
    },
    {
      label: "Menunggu Review",
      value: stats?.pendingReview ?? 0,
      icon: CheckSquare,
      highlight: true,
      onClick: () => applyStatusFilter("PENDING_REVIEW"),
      testId: "stat-menunggu-review",
    },
    {
      label: "Dipublikasikan",
      value: stats?.published ?? 0,
      icon: Eye,
      onClick: () => applyStatusFilter("PUBLISHED"),
      testId: "stat-dipublikasikan",
    },
    {
      label: "Total Views",
      value: stats?.totalViews ?? 0,
      icon: BarChart3,
      testId: "stat-total-views",
    },
  ];

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
          if (!res.ok) throw new Error(data.error || "Gagal memproses aksi massal");
          toast.success(`${data.succeeded} dari ${data.processed} artikel berhasil`);
          await Promise.all([loadArticles(), loadStats()]);
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : "Gagal memproses bulk");
        } finally {
          setBulkLoading(false);
        }
      },
    });
  };

  const handleExport = (format: "csv" | "json") => {
    window.open(
      `/api/admin/articles/export${filterQueryString}${filterQueryString ? "&" : "?"}format=${format}`,
      "_blank",
    );
  };

  const handleApprove = (articleId: string) => {
    confirm({
      title: "Setujui artikel?",
      description: "Artikel akan dipublikasikan dan tampil di situs.",
      confirmLabel: "Setujui",
      variant: "info",
      onConfirm: async () => {
        setActionLoading(articleId);
        try {
          const res = await fetch(`/api/admin/articles/${articleId}/approve`, {
            method: "POST",
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Gagal menyetujui artikel");
          }
          toast.success("Artikel disetujui dan dipublikasikan");
          await Promise.all([loadArticles(), loadStats()]);
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : "Gagal menyetujui artikel");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const openRejectModal = (articleId: string, title: string) => {
    setRejectNote("");
    setRejectTarget({ mode: "single", id: articleId, title });
    setRejectModalOpen(true);
  };

  const openBulkRejectModal = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      toast.error("Pilih minimal satu artikel");
      return;
    }
    setRejectNote("");
    setRejectTarget({ mode: "bulk", count: ids.length });
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setRejectTarget(null);
    setRejectNote("");
  };

  const submitReject = async () => {
    if (!rejectNote.trim()) {
      toast.error("Catatan penolakan wajib diisi");
      return;
    }
    if (!rejectTarget) return;

    setRejectLoading(true);
    const note = rejectNote.trim();

    try {
      if (rejectTarget.mode === "single") {
        setActionLoading(rejectTarget.id);
        const res = await fetch(`/api/admin/articles/${rejectTarget.id}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal menolak artikel");
        }
        toast.success("Artikel berhasil ditolak");
      } else {
        setBulkLoading(true);
        const res = await fetch("/api/admin/articles/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: Array.from(selected),
            action: "reject",
            note,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memproses aksi massal");
        toast.success(`${data.succeeded} dari ${data.processed} artikel berhasil ditolak`);
      }
      closeRejectModal();
      await Promise.all([loadArticles(), loadStats()]);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menolak artikel");
    } finally {
      setRejectLoading(false);
      setActionLoading(null);
      setBulkLoading(false);
    }
  };

  const statusFilters = [
    { v: "", l: "Semua" },
    { v: "PENDING_REVIEW", l: "Review" },
    { v: "PUBLISHED", l: "Dipublikasikan" },
    { v: "REJECTED", l: "Ditolak" },
    { v: "ARCHIVED", l: "Arsip" },
  ];

  return (
    <div className="bg-white min-h-screen" data-testid="admin-articles-page">
      <ConfirmModal {...confirmProps} />
      <RejectArticleModal
        open={rejectModalOpen}
        onOpenChange={(open) => {
          if (!open && !rejectLoading) closeRejectModal();
        }}
        target={rejectTarget}
        note={rejectNote}
        onNoteChange={setRejectNote}
        onConfirm={submitReject}
        loading={rejectLoading}
      />

      <section className="border-b border-jepang-border bg-jepang-off-white">
        <div className="w-full px-4 lg:px-6 py-8">
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

      <div className="w-full px-4 lg:px-6 py-8 space-y-6">
        <div data-testid="admin-articles-stats">
          <AdminStatCards
            loading={statsLoading}
            skeletonCount={4}
            gridClassName="grid grid-cols-2 lg:grid-cols-4 gap-4"
            items={articleStatItems}
          />
        </div>

        <Card className="border border-jepang-border p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((s) => (
              <Button
                key={s.v}
                size="sm"
                variant={statusFilter === s.v ? "black" : "outline"}
                onClick={() => applyStatusFilter(s.v)}
              >
                {s.l}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_200px] gap-3">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-jepang-muted"
              />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari judul atau ringkasan..."
                className="pl-9"
                data-testid="admin-article-search"
              />
            </div>
            <Select
              value={categoryFilter || "_all"}
              onValueChange={(v) => {
                setCategoryFilter(v === "_all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger data-testid="filter-category">
                <SelectValue placeholder="Kategori" />
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
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v);
                setPage(1);
              }}
            >
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
              onClick={openBulkRejectModal}
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
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
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
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="hover:text-jepang-red hover:underline"
                        data-testid={`view-article-${article.id}`}
                      >
                        {article.title}
                      </Link>
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
                      <div className="flex flex-wrap justify-end gap-2">
                        {article.status === "PENDING_REVIEW" && (
                          <>
                            <Button
                              size="sm"
                              disabled={actionLoading === article.id}
                              onClick={() => handleApprove(article.id)}
                              data-testid={`approve-article-${article.id}`}
                            >
                              <Check size={14} className="mr-1" /> Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-jepang-red border-jepang-red hover:bg-jepang-red hover:text-white"
                              disabled={actionLoading === article.id}
                              onClick={() => openRejectModal(article.id, article.title)}
                              data-testid={`reject-article-${article.id}`}
                            >
                              <XCircle size={14} className="mr-1" /> Tolak
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            data-testid={`edit-article-${article.id}`}
                          >
                            <Pencil size={14} className="mr-1" /> Ubah
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
              Halaman {page}/{totalPages} - {totalItems} item
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                data-testid="admin-articles-prev-page"
              >
                <ChevronLeft size={14} className="mr-1" /> Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                data-testid="admin-articles-next-page"
              >
                Berikutnya <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
