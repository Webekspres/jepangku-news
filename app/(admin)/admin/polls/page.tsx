"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, XCircle, Zap, Trash2, BarChart2, MessageSquare, FileEdit } from "lucide-react";
import { toast } from "sonner";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminStatCards from "@/components/admin/AdminStatCards";
import { AdminFilterButtons, AdminToolbar } from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";
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
  ACTIVE: "success",
  DRAFT: "muted",
  CLOSED: "red",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Aktif",
  DRAFT: "Draf",
  CLOSED: "Ditutup",
};

const TYPE_BADGE: Record<
  string,
  "success" | "warning" | "red" | "muted" | "black"
> = {
  POLLING: "black",
  VOTING: "warning",
};

const TYPE_LABEL: Record<string, string> = {
  POLLING: "Polling",
  VOTING: "Voting",
};

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    draft: number;
    closed: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const router = useRouter();
  const { confirm, confirmProps } = useConfirm();

  useEffect(() => {
    fetch("/api/admin/polls/stats")
      .then((r) => parseApiResponse(r))
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    loadPolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  const loadPolls = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("type", typeFilter);
    const url = `/api/admin/polls${params.toString() ? `?${params}` : ""}`;
    const data = await fetch(url).then((r) => parseApiResponse(r));
    setPolls(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleClose = async (pollId: string) => {
    confirm({
      title: "Tutup Polling?",
      description: "Pengguna tidak akan bisa melakukan vote lagi setelah polling ditutup.",
      confirmLabel: "Ya, Tutup",
      variant: "danger",
      onConfirm: async () => {
        setClosing(pollId);
        try {
          const res = await fetch(`/api/admin/polls/${pollId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "CLOSED" }),
          });
          if (!res.ok) throw new Error("Gagal menutup polling");
          toast.success("Polling berhasil ditutup");
          setPolls((prev) =>
            prev.map((p) => (p.id === pollId ? { ...p, status: "CLOSED" } : p)),
          );
        } catch (e: any) {
          toast.error(e.message || "Gagal menutup polling");
        } finally {
          setClosing(null);
        }
      },
    });
  };

  const handleActivate = (pollId: string, title: string) => {
    confirm({
      title: "Aktifkan Polling?",
      description: `"${title}" akan dipublikasikan dan pengguna bisa mulai vote.`,
      confirmLabel: "Ya, Aktifkan",
      variant: "info",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/polls/${pollId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ACTIVE" }),
        });
        if (!res.ok) throw new Error("Gagal mengaktifkan polling");
        toast.success("Polling berhasil diaktifkan");
        setPolls((prev) =>
          prev.map((p) => (p.id === pollId ? { ...p, status: "ACTIVE" } : p)),
        );
      },
    });
  };

  const handleDelete = (pollId: string, title: string) => {
    confirm({
      title: "Hapus Polling?",
      description: `"${title}" akan dihapus secara permanen beserta semua pertanyaannya.`,
      confirmLabel: "Hapus",
      variant: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/polls/${pollId}`, { method: "DELETE" });
        if (!res.ok) {
          const e = await parseApiResponse(res);
          throw new Error(e.error || "Gagal menghapus polling");
        }
        toast.success("Polling berhasil dihapus");
        setPolls((prev) => prev.filter((p) => p.id !== pollId));
      },
    });
  };

  const statusFilters = [
    { value: "", label: "Semua Status", testId: "poll-status-filter-all" },
    { value: "ACTIVE", label: "Aktif", testId: "poll-status-filter-ACTIVE" },
    { value: "DRAFT", label: "Draf", testId: "poll-status-filter-DRAFT" },
    { value: "CLOSED", label: "Ditutup", testId: "poll-status-filter-CLOSED" },
  ];

  const typeFilters = [
    { value: "", label: "Semua Tipe", testId: "poll-type-filter-all" },
    { value: "POLLING", label: "Polling", testId: "poll-type-filter-POLLING" },
    { value: "VOTING", label: "Voting", testId: "poll-type-filter-VOTING" },
  ];

  return (
    <>
      <ConfirmModal {...confirmProps} />

      <AdminPageLayout
        testId="admin-polls-page"
        title="Semua Polling"
        headerActions={
          <Button asChild size="sm" data-testid="create-poll-btn">
            <Link href="/admin/polls/create">
              <Plus size={14} className="mr-1" /> Buat Polling
            </Link>
          </Button>
        }
      >
        <AdminStatCards
          loading={statsLoading}
          skeletonCount={4}
          gridClassName="grid grid-cols-2 lg:grid-cols-4 gap-4"
          items={[
            {
              label: "Total Polling",
              value: stats?.total ?? 0,
              icon: MessageSquare,
              onClick: () => setStatusFilter(""),
              testId: "stat-total-polling",
            },
            {
              label: "Aktif",
              value: stats?.active ?? 0,
              icon: Zap,
              onClick: () => setStatusFilter("ACTIVE"),
              testId: "stat-polling-aktif",
            },
            {
              label: "Draf",
              value: stats?.draft ?? 0,
              icon: FileEdit,
              onClick: () => setStatusFilter("DRAFT"),
              testId: "stat-polling-draft",
            },
            {
              label: "Ditutup",
              value: stats?.closed ?? 0,
              icon: XCircle,
              onClick: () => setStatusFilter("CLOSED"),
              testId: "stat-polling-ditutup",
            },
          ]}
        />
        <AdminToolbar>
          <AdminFilterButtons
            options={statusFilters}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <AdminFilterButtons
            options={typeFilters}
            value={typeFilter}
            onChange={setTypeFilter}
          />
        </AdminToolbar>

        <AdminCard
          title={`${loading && polls.length === 0 ? "..." : polls.length} POLLING`}
          variant="list"
          noPadding
          className="overflow-x-auto"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>JUDUL</TableHead>
                <TableHead>TIPE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>PERTANYAAN</TableHead>
                <TableHead>SUARA</TableHead>
                <TableHead>POIN</TableHead>
                <TableHead>TAMU</TableHead>
                <TableHead>DIBUAT</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && polls.length === 0 ? (
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                  <TableRow key={r}>
                    {[...Array(9)].map((_, i) => (
                      <TableCell key={i}>
                        <SkeletonBox height="0.9rem" width={i === 0 ? "70%" : "40%"} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : polls.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-jepang-muted py-12"
                  >
                    Tidak ada polling ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                polls.map((poll: any) => (
                  <TableRow key={poll.id} data-testid={`admin-poll-row-${poll.id}`}>
                    <TableCell className="font-semibold max-w-xs">
                      <div className="truncate">{poll.title}</div>
                      <div className="text-xs text-jepang-muted font-mono">
                        {poll.slug}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={TYPE_BADGE[poll.pollType] || "muted"}>
                        {TYPE_LABEL[poll.pollType] || poll.pollType}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={STATUS_BADGE[poll.status] || "muted"}>
                        {STATUS_LABEL[poll.status] || poll.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono text-center">
                      {poll._count?.questions ?? 0}
                    </TableCell>

                    <TableCell className="font-mono text-center">
                      {poll._count?.votes ?? 0}
                    </TableCell>

                    <TableCell className="font-mono">
                      {poll.pointsReward}
                    </TableCell>

                    <TableCell className="text-center">
                      {poll.allowGuestVote ? (
                        <span className="text-xs font-semibold text-green-600">Ya</span>
                      ) : (
                        <span className="text-xs text-jepang-muted">Tidak</span>
                      )}
                    </TableCell>

                    <TableCell className="text-jepang-muted text-sm">
                      {new Date(poll.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/polls/${poll.id}/analytics`)}
                          data-testid={`poll-stats-${poll.id}`}
                          className="border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white"
                        >
                          <BarChart2 size={13} className="mr-1" /> Statistik
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/polls/${poll.id}/edit`)}
                          data-testid={`edit-poll-${poll.id}`}
                          className="hover:bg-foreground hover:text-white"
                        >
                          <Pencil size={13} className="mr-1" /> Ubah
                        </Button>
                        {poll.status === "DRAFT" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleActivate(poll.id, poll.title)}
                              data-testid={`activate-poll-${poll.id}`}
                              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                            >
                              <Zap size={13} className="mr-1" /> Aktifkan
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(poll.id, poll.title)}
                              data-testid={`delete-poll-${poll.id}`}
                              className="border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white"
                            >
                              <Trash2 size={13} className="mr-1" /> Hapus
                            </Button>
                          </>
                        )}
                        {poll.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={closing === poll.id}
                            onClick={() => handleClose(poll.id)}
                            data-testid={`close-poll-${poll.id}`}
                            className="border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white"
                          >
                            <XCircle size={13} className="mr-1" />
                            {closing === poll.id ? "Menutup..." : "Tutup"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </AdminCard>
      </AdminPageLayout>
    </>
  );
}
