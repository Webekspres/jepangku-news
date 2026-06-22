"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Trash2, Mail, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminStatCards from "@/components/admin/AdminStatCards";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  AdminFilterButtons,
  AdminSearchInput,
  AdminToolbar,
} from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
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
import type { AdminNewsletterRow } from "@/lib/newsletter";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
  { value: "all", label: "Semua" },
];

export default function AdminNewsletterPage() {
  const [subscriptions, setSubscriptions] = useState<AdminNewsletterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("active");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stats, setStats] = useState<{ total: number; fromUser: number; nonUser: number } | null>(
    null,
  );
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/newsletter/stats")
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
      if (search.trim()) sp.set("search", search.trim());
      const data = await fetch(`/api/admin/newsletter?${sp}`).then((r) => r.json());
      setSubscriptions(Array.isArray(data.subscriptions) ? data.subscriptions : []);
      setTotalPages(Number(data.totalPages || 1));
      setTotal(Number(data.total || 0));
    } catch {
      toast.error("Gagal memuat subscriber newsletter");
    } finally {
      setLoading(false);
    }
  }, [status, page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus subscriber ini dari database?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menghapus");
        return;
      }
      toast.success("Subscriber dihapus");
      await load();
      fetch("/api/admin/newsletter/stats")
        .then((r) => r.json())
        .then(setStats);
    } catch {
      toast.error("Gagal menghapus");
    } finally {
      setDeletingId(null);
    }
  };

  const exportCsv = () => {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (search.trim()) sp.set("search", search.trim());
    window.location.href = `/api/admin/newsletter/export?${sp}`;
  };

  return (
    <AdminPageLayout
      testId="admin-newsletter"
      title="Newsletter"
      subtitle="Kelola subscriber newsletter portal"
      headerActions={
        <Button type="button" variant="outline" onClick={exportCsv}>
          <Download className="h-4 w-4 mr-2" aria-hidden />
          Export CSV
        </Button>
      }
    >
      <AdminStatCards
        loading={statsLoading}
        skeletonCount={3}
        gridClassName="grid grid-cols-1 sm:grid-cols-3 gap-4"
        items={[
          {
            label: "Total Subscriber",
            value: stats?.total ?? 0,
            icon: Mail,
            testId: "stat-total-subscriber",
          },
          {
            label: "Dari Pengguna",
            value: stats?.fromUser ?? 0,
            icon: UserCheck,
            testId: "stat-subscriber-user",
          },
          {
            label: "Non-Pengguna",
            value: stats?.nonUser ?? 0,
            icon: UserX,
            testId: "stat-subscriber-non-user",
          },
        ]}
      />
      <AdminToolbar>
        <AdminFilterButtons
          options={STATUS_FILTERS}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari email…"
          onSubmit={() => setPage(1)}
        />
      </AdminToolbar>

      <AdminCard
        title={`${loading ? "..." : total} SUBSCRIBER`}
        variant="list"
        noPadding
        className="overflow-x-auto"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>EMAIL</TableHead>
              <TableHead>AKUN</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>BERLANGGANAN</TableHead>
              <TableHead className="w-16">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && subscriptions.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><SkeletonBox height="0.9rem" width="12rem" /></TableCell>
                  <TableCell><SkeletonBox height="0.9rem" width="6rem" /></TableCell>
                  <TableCell><SkeletonBox height="0.9rem" width="4rem" /></TableCell>
                  <TableCell><SkeletonBox height="0.9rem" width="5rem" /></TableCell>
                  <TableCell><SkeletonBox height="1.6rem" width="2rem" /></TableCell>
                </TableRow>
              ))
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <AdminEmptyState
                    title="Belum ada subscriber"
                    description="Subscriber dari form footer akan muncul di sini."
                  />
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((row) => (
                <TableRow key={row.id} data-testid={`newsletter-row-${row.id}`}>
                  <TableCell className="font-mono text-xs">{row.email}</TableCell>
                  <TableCell className="text-jepang-muted text-xs">
                    {row.username ? `@${row.username}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.isActive ? "success" : "muted"}>
                      {row.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-jepang-muted text-xs whitespace-nowrap">
                    {new Date(row.subscribedAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="border border-jepang-border hover:border-jepang-red hover:text-jepang-red"
                      disabled={deletingId === row.id}
                      onClick={() => handleDelete(row.id)}
                      aria-label="Hapus subscriber"
                      data-testid={`delete-newsletter-${row.id}`}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminCard>

      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </AdminPageLayout>
  );
}
