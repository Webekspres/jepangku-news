"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  AdminFilterButtons,
  AdminSearchInput,
  AdminToolbar,
} from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
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

      <AdminCard title={`Subscriber (${total})`} variant="panel" noPadding>
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} height="3rem" width="100%" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <AdminEmptyState
            title="Belum ada subscriber"
            description="Subscriber dari form footer akan muncul di sini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Akun</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Berlangganan</th>
                  <th className="px-4 py-3 font-medium w-24" />
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-xs sm:text-sm">{row.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.username ? `@${row.username}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          row.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-zinc-100 text-zinc-600"
                        }
                      >
                        {row.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(row.subscribedAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        disabled={deletingId === row.id}
                        onClick={() => handleDelete(row.id)}
                        aria-label="Hapus subscriber"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </AdminPageLayout>
  );
}
