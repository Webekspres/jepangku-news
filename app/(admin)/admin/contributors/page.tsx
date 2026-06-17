"use client";
export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, X, Search, UserPlus, ExternalLink } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import type { AdminContributorApplication } from "@/lib/contributor-applications";

const STATUS_FILTERS = [
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "", label: "Semua" },
] as const;

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function AdminContributorsPage() {
  const [applications, setApplications] = useState<AdminContributorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<AdminContributorApplication | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (status) sp.set("status", status);
      sp.set("page", String(page));
      const data = await fetch(`/api/admin/contributors?${sp}`).then((r) => r.json());
      const list = Array.isArray(data.applications) ? data.applications : [];
      setApplications(list);
      setTotalPages(Number(data.totalPages || 1));
      setTotal(Number(data.total || list.length));
      setSelected((prev) => {
        if (!prev) return list[0] ?? null;
        return list.find((item: AdminContributorApplication) => item.id === prev.id) ?? list[0] ?? null;
      });
    } catch {
      toast.error("Gagal memuat permohonan kontributor");
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = search.trim()
    ? applications.filter((item) => {
        const q = search.trim().toLowerCase();
        return (
          item.user.name.toLowerCase().includes(q) ||
          item.user.username.toLowerCase().includes(q) ||
          item.user.email.toLowerCase().includes(q) ||
          item.motivation.toLowerCase().includes(q)
        );
      })
    : applications;

  const handleReview = async (action: "approve" | "reject") => {
    if (!selected) return;
    if (action === "reject" && !adminNote.trim()) {
      toast.error("Catatan penolakan wajib diisi");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/contributors/${selected.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNote: adminNote.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal memproses permohonan");
        return;
      }

      toast.success(action === "approve" ? "Kontributor disetujui" : "Permohonan ditolak");
      setAdminNote("");
      setSelected(null);
      await load();
    } catch {
      toast.error("Gagal memproses permohonan");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full px-4 py-8 lg:px-6" data-testid="admin-contributors">
      <SectionHeader
        label="管理 / ADMIN"
        title="Permohonan Kontributor"
        subtitle="Tinjau dan setujui pengguna yang ingin mengunggah artikel"
        className="border-b border-jepang-border bg-jepang-navy text-white"
        fullWidth
      />

      <div className="py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value || "all"}
              variant={status === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatus(filter.value);
                setPage(1);
              }}
            >
              {filter.label}
            </Button>
          ))}
          <div className="relative ml-auto w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-jepang-muted"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau email…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBox key={i} height="5.5rem" width="100%" />
              ))
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-jepang-muted">
                  Tidak ada permohonan untuk filter ini.
                </CardContent>
              </Card>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelected(item);
                    setAdminNote("");
                  }}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    selected?.id === item.id
                      ? "border-jepang-orange bg-jepang-cream/50"
                      : "border-jepang-border bg-white hover:border-jepang-orange/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-jepang-navy">{item.user.name}</p>
                      <p className="text-xs text-jepang-muted">@{item.user.username}</p>
                    </div>
                    <Badge className={STATUS_BADGE[item.status] ?? ""}>{item.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-jepang-muted line-clamp-2">
                    {item.motivation}
                  </p>
                  <p className="mt-2 text-[11px] text-jepang-muted">
                    {new Date(item.createdAt).toLocaleString("id-ID")}
                  </p>
                </button>
              ))
            )}

            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Sebelumnya
                </Button>
                <span className="text-xs text-jepang-muted">
                  Halaman {page} / {totalPages} ({total} total)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            {!selected ? (
              <Card>
                <CardContent className="flex min-h-80
                 items-center justify-center text-sm text-jepang-muted">
                  <div className="text-center">
                    <UserPlus className="mx-auto mb-3 text-jepang-muted" size={28} />
                    Pilih permohonan untuk ditinjau
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="space-y-5 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-jepang-navy">
                        {selected.user.name}
                      </h2>
                      <p className="text-sm text-jepang-muted">
                        @{selected.user.username} · {selected.user.email}
                      </p>
                      <p className="text-xs text-jepang-muted mt-1">
                        Bergabung {new Date(selected.user.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <Badge className={STATUS_BADGE[selected.status] ?? ""}>
                      {selected.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/users`}>Kelola Pengguna</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/profile/${selected.user.username}`} target="_blank">
                        Profil Publik
                        <ExternalLink size={14} className="ml-1" />
                      </Link>
                    </Button>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-jepang-navy mb-2">Motivasi</p>
                    <p className="whitespace-pre-wrap rounded-md border border-jepang-border bg-jepang-cream/30 p-4 text-sm">
                      {selected.motivation}
                    </p>
                  </div>

                  {selected.portfolioUrl && (
                    <div>
                      <p className="text-sm font-semibold text-jepang-navy mb-2">Portofolio</p>
                      <a
                        href={selected.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-jepang-orange hover:underline break-all"
                      >
                        {selected.portfolioUrl}
                      </a>
                    </div>
                  )}

                  {selected.adminNote && selected.status !== "PENDING" && (
                    <div>
                      <p className="text-sm font-semibold text-jepang-navy mb-2">Catatan Admin</p>
                      <p className="whitespace-pre-wrap text-sm text-jepang-muted">
                        {selected.adminNote}
                      </p>
                    </div>
                  )}

                  {selected.status === "PENDING" && (
                    <div className="space-y-4 border-t border-jepang-border pt-5">
                      <div className="space-y-2">
                        <Label htmlFor="adminNote">Catatan admin (wajib untuk tolak)</Label>
                        <Textarea
                          id="adminNote"
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Alasan persetujuan atau penolakan…"
                          rows={4}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => handleReview("approve")}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check size={16} className="mr-2" />
                          Setujui
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReview("reject")}
                          disabled={processing}
                        >
                          <X size={16} className="mr-2" />
                          Tolak
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
