"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
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
  DRAFT: "Draft",
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

  const filters = [
    { v: "", l: "Semua" },
    { v: "ACTIVE", l: "Aktif" },
    { v: "DRAFT", l: "Draft" },
    { v: "INACTIVE", l: "Tidak Aktif" },
  ];

  return (
    <div className="bg-white min-h-screen" data-testid="admin-quizzes-page">
      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-4"
          >
            <ArrowLeft size={14} /> Kembali ke Dashboard
          </Link>

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

      <div className="px-4 mx-auto max-w-7xl py-8">
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
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && quizzes.length === 0 ? (
                [1, 2, 3].map((r) => (
                  <TableRow key={r}>
                    {[...Array(7)].map((_, i) => (
                      <TableCell key={i}>
                        <SkeletonBox height="0.9rem" width={i === 0 ? "70%" : "40%"} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : quizzes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
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
