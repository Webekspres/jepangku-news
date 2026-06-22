"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, X, UserPlus, ExternalLink, Eye, ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminStatCards from "@/components/admin/AdminStatCards";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminDetailModal, { AdminDetailRow } from "@/components/admin/AdminDetailModal";
import {
  AdminFilterButtons,
  AdminSearchInput,
  AdminToolbar,
} from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminContributorApplication } from "@/lib/contributor-applications";

const STATUS_FILTERS = [
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "", label: "Semua" },
] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

const STATUS_BADGE_VARIANT: Record<string, "warning" | "success" | "red" | "muted"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "red",
};

export default function AdminContributorsPage() {
  const [applications, setApplications] = useState<AdminContributorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<AdminContributorApplication | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    approved: number;
    rejected: number;
    pending: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/contributors/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

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

  const openDetail = (item: AdminContributorApplication) => {
    setSelected(item);
    setAdminNote("");
    setDetailOpen(true);
  };

  const handleReview = async (
    action: "approve" | "reject",
    item: AdminContributorApplication | null = selected,
  ) => {
    if (!item) return;
    if (action === "reject" && !adminNote.trim()) {
      toast.error("Catatan penolakan wajib diisi");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/contributors/${item.id}`, {
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
      setDetailOpen(false);
      setSelected(null);
      await load();
      fetch("/api/admin/contributors/stats")
        .then((r) => r.json())
        .then(setStats);
    } catch {
      toast.error("Gagal memproses permohonan");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <AdminPageLayout
        testId="admin-contributors"
        title="Permohonan Kontributor"
        subtitle="Tinjau dan setujui pengguna yang ingin mengunggah artikel"
      >
        <AdminStatCards
          loading={statsLoading}
          skeletonCount={4}
          gridClassName="grid grid-cols-2 lg:grid-cols-4 gap-4"
          items={[
            {
              label: "Total Permohonan",
              value: stats?.total ?? 0,
              icon: ClipboardList,
              onClick: () => {
                setStatus("");
                setPage(1);
              },
              testId: "stat-total-permohonan",
            },
            {
              label: "Menunggu",
              value: stats?.pending ?? 0,
              icon: Clock,
              highlight: true,
              onClick: () => {
                setStatus("PENDING");
                setPage(1);
              },
              testId: "stat-permohonan-menunggu",
            },
            {
              label: "Disetujui",
              value: stats?.approved ?? 0,
              icon: CheckCircle,
              onClick: () => {
                setStatus("APPROVED");
                setPage(1);
              },
              testId: "stat-permohonan-disetujui",
            },
            {
              label: "Ditolak",
              value: stats?.rejected ?? 0,
              icon: XCircle,
              onClick: () => {
                setStatus("REJECTED");
                setPage(1);
              },
              testId: "stat-permohonan-ditolak",
            },
          ]}
        />
        <AdminToolbar>
          <AdminFilterButtons
            options={[...STATUS_FILTERS]}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari nama atau email…"
          />
        </AdminToolbar>

        <AdminCard
          title={`${loading ? "..." : total} PERMOHONAN`}
          variant="list"
          noPadding
          className="overflow-x-auto"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PENGGUNA</TableHead>
                <TableHead>EMAIL</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>DIAJUKAN</TableHead>
                <TableHead>AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && filtered.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><SkeletonBox height="0.9rem" width="8rem" /></TableCell>
                    <TableCell><SkeletonBox height="0.9rem" width="10rem" /></TableCell>
                    <TableCell><SkeletonBox height="0.9rem" width="4rem" /></TableCell>
                    <TableCell><SkeletonBox height="0.9rem" width="5rem" /></TableCell>
                    <TableCell><SkeletonBox height="1.6rem" width="8rem" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <AdminEmptyState
                      icon={UserPlus}
                      title="Tidak ada permohonan untuk filter ini."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.id} data-testid={`contributor-row-${item.id}`}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-sm">{item.user.name}</p>
                        <p className="text-xs text-jepang-muted font-mono">
                          @{item.user.username}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-jepang-muted text-xs">
                      {item.user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_VARIANT[item.status] ?? "muted"}>
                        {STATUS_LABEL[item.status] ?? item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-jepang-muted text-xs whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetail(item)}
                          data-testid={`view-contributor-${item.id}`}
                        >
                          <Eye size={12} className="mr-1" />
                          Detail
                        </Button>
                        {item.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                              disabled={processing}
                              onClick={() => {
                                setSelected(item);
                                setAdminNote("");
                                handleReview("approve", item);
                              }}
                              data-testid={`approve-contributor-${item.id}`}
                            >
                              <Check size={12} className="mr-1" />
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white"
                              onClick={() => openDetail(item)}
                              data-testid={`reject-contributor-${item.id}`}
                            >
                              <X size={12} className="mr-1" />
                              Tolak
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </AdminCard>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </AdminPageLayout>

      <AdminDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={selected?.user.name ?? "Detail Permohonan"}
        subtitle={
          selected
            ? `@${selected.user.username} · ${selected.user.email}`
            : undefined
        }
        testId="contributor-detail-modal"
        footer={
          selected?.status === "PENDING" ? (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailOpen(false)}
              >
                Batal
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={processing}
                onClick={() => handleReview("approve")}
              >
                <Check size={14} className="mr-1" />
                Setujui
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={processing}
                onClick={() => handleReview("reject")}
              >
                <X size={14} className="mr-1" />
                Tolak
              </Button>
            </div>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-1">
            <AdminDetailRow label="Status">
              <Badge variant={STATUS_BADGE_VARIANT[selected.status] ?? "muted"}>
                {STATUS_LABEL[selected.status] ?? selected.status}
              </Badge>
            </AdminDetailRow>
            <AdminDetailRow label="Diajukan">
              {new Date(selected.createdAt).toLocaleString("id-ID")}
            </AdminDetailRow>
            <AdminDetailRow label="Bergabung">
              {new Date(selected.user.createdAt).toLocaleDateString("id-ID")}
            </AdminDetailRow>
            <AdminDetailRow label="Motivasi">
              <p className="whitespace-pre-wrap text-sm">{selected.motivation}</p>
            </AdminDetailRow>
            {selected.portfolioUrl && (
              <AdminDetailRow label="Portofolio">
                <a
                  href={selected.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-jepang-orange hover:underline break-all text-sm"
                >
                  {selected.portfolioUrl}
                </a>
              </AdminDetailRow>
            )}
            {selected.adminNote && selected.status !== "PENDING" && (
              <AdminDetailRow label="Catatan Admin">
                <p className="whitespace-pre-wrap text-sm text-jepang-muted">
                  {selected.adminNote}
                </p>
              </AdminDetailRow>
            )}
            <div className="flex flex-wrap gap-2 pt-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/users">Kelola Pengguna</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/profile/${selected.user.username}`} target="_blank">
                  Profil Publik
                  <ExternalLink size={14} className="ml-1" />
                </Link>
              </Button>
            </div>
            {selected.status === "PENDING" && (
              <div className="space-y-2 pt-4 border-t border-jepang-border mt-4">
                <Label htmlFor="adminNote">Catatan admin (wajib untuk tolak)</Label>
                <Textarea
                  id="adminNote"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Alasan persetujuan atau penolakan…"
                  rows={3}
                />
              </div>
            )}
          </div>
        )}
      </AdminDetailModal>
    </>
  );
}
