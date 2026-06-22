"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Zap, Trash2, BarChart2, FileEdit, EyeOff } from "lucide-react";
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
  INACTIVE: "red",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Aktif",
  DRAFT: "Draf",
  INACTIVE: "Tidak Aktif",
};

const TYPE_LABEL: Record<string, string> = {
  trivia: "Trivia",
  personality: "Kepribadian",
  knowledge: "Pengetahuan",
};

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    draft: number;
    inactive: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const router = useRouter();
  const { confirm, confirmProps } = useConfirm();

  useEffect(() => {
    fetch("/api/admin/quizzes/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    loadQuizzes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadQuizzes = async () => {
    setLoading(true);
    const url = filter
      ? `/api/admin/quizzes?status=${filter}`
      : "/api/admin/quizzes";
    const data = await fetch(url).then((r) => r.json());
    setQuizzes(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleActivate = (quizId: string, title: string) => {
    confirm({
      title: "Aktifkan Kuis?",
      description: `"${title}" akan dipublikasikan dan bisa diakses oleh pengguna.`,
      confirmLabel: "Ya, Aktifkan",
      variant: "info",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/quizzes/${quizId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ACTIVE" }),
        });
        if (!res.ok) throw new Error("Gagal mengaktifkan kuis");
        toast.success("Kuis berhasil diaktifkan");
        setQuizzes((prev) =>
          prev.map((q) => (q.id === quizId ? { ...q, status: "ACTIVE" } : q)),
        );
      },
    });
  };

  const handleDelete = (quizId: string, title: string) => {
    confirm({
      title: "Hapus Kuis?",
      description: `"${title}" akan dihapus secara permanen beserta semua pertanyaannya.`,
      confirmLabel: "Hapus",
      variant: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/quizzes/${quizId}`, { method: "DELETE" });
        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.error || "Gagal menghapus kuis");
        }
        toast.success("Kuis berhasil dihapus");
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      },
    });
  };

  const filters = [
    { value: "", label: "Semua", testId: "quiz-filter-all" },
    { value: "ACTIVE", label: "Aktif", testId: "quiz-filter-ACTIVE" },
    { value: "DRAFT", label: "Draf", testId: "quiz-filter-DRAFT" },
    { value: "INACTIVE", label: "Tidak Aktif", testId: "quiz-filter-INACTIVE" },
  ];

  return (
    <>
      <ConfirmModal {...confirmProps} />

      <AdminPageLayout
        testId="admin-quizzes-page"
        title="Semua Kuis"
        headerActions={
          <Button asChild size="sm" data-testid="create-quiz-btn">
            <Link href="/admin/quizzes/create">
              <Plus size={14} className="mr-1" /> Buat Kuis
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
              label: "Total Kuis",
              value: stats?.total ?? 0,
              icon: Zap,
              onClick: () => setFilter(""),
              testId: "stat-total-kuis",
            },
            {
              label: "Aktif",
              value: stats?.active ?? 0,
              icon: Zap,
              onClick: () => setFilter("ACTIVE"),
              testId: "stat-kuis-aktif",
            },
            {
              label: "Draf",
              value: stats?.draft ?? 0,
              icon: FileEdit,
              onClick: () => setFilter("DRAFT"),
              testId: "stat-kuis-draft",
            },
            {
              label: "Tidak Aktif",
              value: stats?.inactive ?? 0,
              icon: EyeOff,
              onClick: () => setFilter("INACTIVE"),
              testId: "stat-kuis-tidak-aktif",
            },
          ]}
        />
        <AdminToolbar>
          <AdminFilterButtons options={filters} value={filter} onChange={setFilter} />
        </AdminToolbar>

        <AdminCard
          title={`${loading && quizzes.length === 0 ? "..." : quizzes.length} KUIS`}
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
                <TableHead>PERCOBAAN</TableHead>
                <TableHead>POIN</TableHead>
                <TableHead>DIBUAT</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && quizzes.length === 0 ? (
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                  <TableRow key={r}>
                    {[...Array(8)].map((_, i) => (
                      <TableCell key={i}>
                        <SkeletonBox height="0.9rem" width={i === 0 ? "70%" : "40%"} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : quizzes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-jepang-muted py-12"
                  >
                    Tidak ada kuis ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                quizzes.map((quiz: any) => (
                  <TableRow key={quiz.id} data-testid={`admin-quiz-row-${quiz.id}`}>
                    <TableCell className="font-semibold max-w-xs">
                      <div className="truncate">{quiz.title}</div>
                      <div className="text-xs text-jepang-muted font-mono">
                        {quiz.slug}
                      </div>
                    </TableCell>

                    <TableCell className="text-jepang-muted">
                      {TYPE_LABEL[quiz.quizType] || quiz.quizType}
                    </TableCell>

                    <TableCell>
                      <Badge variant={STATUS_BADGE[quiz.status] || "muted"}>
                        {STATUS_LABEL[quiz.status] || quiz.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono text-center">
                      {quiz._count?.questions ?? 0}
                    </TableCell>

                    <TableCell className="font-mono text-center">
                      {quiz._count?.attempts ?? 0}
                    </TableCell>

                    <TableCell className="font-mono">
                      {quiz.pointsReward}
                      {quiz.correctAnswerPoints > 0 && (
                        <span className="text-jepang-muted">
                          {" "}+{quiz.correctAnswerPoints}/benar
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-jepang-muted text-sm">
                      {new Date(quiz.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/quizzes/${quiz.id}/analytics`)}
                          data-testid={`quiz-stats-${quiz.id}`}
                          className="border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white"
                        >
                          <BarChart2 size={13} className="mr-1" /> Statistik
                        </Button>
                        {quiz.status === "DRAFT" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/quizzes/${quiz.id}/edit`)}
                              data-testid={`edit-quiz-${quiz.id}`}
                              className="hover:bg-foreground hover:text-white"
                            >
                              <Pencil size={13} className="mr-1" /> Ubah
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleActivate(quiz.id, quiz.title)}
                              data-testid={`activate-quiz-${quiz.id}`}
                              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                            >
                              <Zap size={13} className="mr-1" /> Aktifkan
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(quiz.id, quiz.title)}
                              data-testid={`delete-quiz-${quiz.id}`}
                              className="border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white"
                            >
                              <Trash2 size={13} className="mr-1" /> Hapus
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
      </AdminPageLayout>
    </>
  );
}
