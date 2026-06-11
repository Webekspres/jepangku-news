"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, XCircle, Zap, Trash2, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  const router = useRouter();
  const { confirm, confirmProps } = useConfirm();

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
    const data = await fetch(url).then((r) => r.json());
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
          const e = await res.json();
          throw new Error(e.error || "Gagal menghapus polling");
        }
        toast.success("Polling berhasil dihapus");
        setPolls((prev) => prev.filter((p) => p.id !== pollId));
      },
    });
  };

  const statusFilters = [
    { v: "", l: "Semua Status" },
    { v: "ACTIVE", l: "Aktif" },
    { v: "DRAFT", l: "Draf" },
    { v: "CLOSED", l: "Ditutup" },
  ];

  const typeFilters = [
    { v: "", l: "Semua Tipe" },
    { v: "POLLING", l: "Polling" },
    { v: "VOTING", l: "Voting" },
  ];

  return (
    <div className="bg-white min-h-screen" data-testid="admin-polls-page">
      <ConfirmModal {...confirmProps} />
      <section className="border-b border-jepang-border bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-heading font-black text-4xl tracking-tighter">
              Semua Polling
            </h1>
            <Button asChild size="sm" data-testid="create-poll-btn">
              <Link href="/admin/polls/create">
                <Plus size={14} className="mr-1" /> Buat Polling
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((s) => (
              <Button
                key={s.v}
                size="sm"
                variant={statusFilter === s.v ? "black" : "outline"}
                onClick={() => setStatusFilter(s.v)}
                data-testid={`poll-status-filter-${s.v || "all"}`}
              >
                {s.l}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((t) => (
              <Button
                key={t.v}
                size="sm"
                variant={typeFilter === t.v ? "black" : "outline"}
                onClick={() => setTypeFilter(t.v)}
                data-testid={`poll-type-filter-${t.v || "all"}`}
              >
                {t.l}
              </Button>
            ))}
          </div>
        </div>

        <Card className="border border-foreground overflow-x-auto">
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
                [1, 2, 3].map((r) => (
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
                          onClick={() => router.push(`/admin/analytics/polls/${poll.id}`)}
                          data-testid={`poll-stats-${poll.id}`}
                          className="border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white"
                        >
                          <BarChart2 size={13} className="mr-1" /> Statistik
                        </Button>
                        {poll.status === "DRAFT" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/polls/${poll.id}/edit`)}
                              data-testid={`edit-poll-${poll.id}`}
                              className="hover:bg-foreground hover:text-white"
                            >
                              <Pencil size={13} className="mr-1" /> Ubah
                            </Button>
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
        </Card>
      </div>
    </div>
  );
}
