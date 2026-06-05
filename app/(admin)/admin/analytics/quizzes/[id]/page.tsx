"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Zap } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import AnalyticsNav from "@/components/admin/AnalyticsNav";
import SimpleBarChart from "@/components/admin/SimpleBarChart";

export default function QuizAnalyticsPage() {
  const { id } = useParams<{ id: string }>()!;
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || (user as any).role !== "ADMIN")) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || (user as any).role !== "ADMIN") return;
    fetch(`/api/admin/analytics/quizzes/${id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setFetching(false));
  }, [user, id]);

  if (loading || !user || (user as any).role !== "ADMIN") return null;

  const quiz = data?.quiz;

  return (
    <AdminPageShell
      title={quiz ? `Kuis: ${quiz.title}` : "Statistik Kuis"}
      subtitle="Pass rate = persentase attempt dengan ≥70% jawaban benar. Distribusi skor berdasarkan rasio benar/total pertanyaan."
      backHref="/admin/quizzes"
      backLabel="Kembali ke Daftar Kuis"
    >
      <AnalyticsNav extra={{ href: "#", label: "Detail Kuis", icon: Zap }} />

      {fetching ? (
        <p className="text-center text-jepang-muted py-12">Memuat...</p>
      ) : !quiz ? (
        <p className="text-center text-jepang-muted py-12">Kuis tidak ditemukan.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatBox label="Total Attempt" value={data.totalAttempts} />
            <StatBox label="User Unik" value={data.uniqueUsers} />
            <StatBox label="Pass Rate" value={`${data.passRate}%`} highlight />
            <StatBox label="Rata-rata Skor" value={`${data.averageScorePercent}%`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="border border-jepang-border p-5">
              <h2 className="font-heading font-bold text-lg mb-4">Distribusi Skor</h2>
              <SimpleBarChart
                data={(data.scoreDistribution || []).map((b: any) => ({
                  label: b.label,
                  value: b.count,
                }))}
                valueLabel="Jumlah attempt"
              />
            </div>
            <div className="border border-jepang-border p-5">
              <h2 className="font-heading font-bold text-lg mb-4">Attempt per Hari</h2>
              <SimpleBarChart
                data={(data.attemptsByDay || []).map((d: any) => ({
                  label: d.date.slice(5),
                  value: d.count,
                }))}
                valueLabel="Attempt harian"
              />
            </div>
          </div>

          {quiz.slug && (
            <Link
              href={`/quizzes/${quiz.slug}`}
              className="text-xs font-mono uppercase text-jepang-red hover:underline"
              target="_blank"
            >
              Lihat kuis publik →
            </Link>
          )}
        </>
      )}
    </AdminPageShell>
  );
}

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="border border-jepang-border p-4 text-center">
      <p className="text-[10px] font-mono uppercase text-jepang-muted">{label}</p>
      <p className={`font-mono font-black text-2xl mt-1 ${highlight ? "text-jepang-red" : ""}`}>
        {value}
      </p>
    </div>
  );
}
