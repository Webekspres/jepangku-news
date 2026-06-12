"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Zap, Trash2, BarChart2 } from "lucide-react";
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
  const router = useRouter();
  const { confirm, confirmProps } = useConfirm();

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
    { v: "", l: "Semua" },
    { v: "ACTIVE", l: "Aktif" },
    { v: "DRAFT", l: "Draf" },
    { v: "INACTIVE", l: "Tidak Aktif" },
  ];

  return (
    <div className="bg-white min-h-screen" data-testid="admin-quizzes-page">
      <ConfirmModal {...confirmProps} />
      <section className="border-b border-jepang-border bg-jepang-off-white">
        <div className="w-full px-4 lg:px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-heading font-black text-4xl tracking-tighter">
              Semua Kuis
            </h1>
            <Button asChild size="sm" data-testid="create-quiz-btn">
              <Link href="/admin/quizzes/create">
                <Plus size={14} className="mr-1" /> Buat Kuis
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="w-full px-4 lg:px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((s) => (
            <Button
              key={s.v}
              size="sm"
              variant={filter === s.v ? "black" : "outline"}
              onClick={() => setFilter(s.v)}
              data-testid={`quiz-filter-${s.v || "all"}`}
            >
              {s.l}
            </Button>
          ))}
        </div>

        <Card className="border border-foreground overflow-x-auto">
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
                [1, 2, 3].map((r) => (
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
                          onClick={() => router.push(`/admin/analytics/quizzes/${quiz.id}`)}
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
        </Card>
      </div>
    </div>
  );
}
