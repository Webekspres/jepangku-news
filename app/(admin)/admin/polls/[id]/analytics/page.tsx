"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminPageShell from "@/components/admin/AdminPageShell";
import SimpleBarChart from "@/components/admin/SimpleBarChart";

export default function PollAnalyticsPage() {
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
    fetch(`/api/admin/analytics/polls/${id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setFetching(false));
  }, [user, id]);

  if (loading || !user || (user as any).role !== "ADMIN") return null;

  const poll = data?.poll;

  return (
    <AdminPageShell
      title={poll ? `Polling: ${poll.title}` : "Statistik Polling"}
      subtitle="Breakdown suara dihitung dari record vote aktual. Grafik tren menunjukkan jumlah vote baru per hari."
      label="Polling"
      backHref="/admin/polls"
      backLabel="Kembali ke Daftar Polling"
    >
      {fetching ? (
        <p className="text-center text-jepang-muted py-12">Memuat...</p>
      ) : !poll ? (
        <p className="text-center text-jepang-muted py-12">Polling tidak ditemukan.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-8 max-w-md">
            <div className="border border-jepang-border p-4 text-center">
              <p className="text-[10px] font-mono uppercase text-jepang-muted">Total Suara</p>
              <p className="font-mono font-black text-3xl mt-1">{data.totalVotes}</p>
            </div>
            <div className="border border-jepang-border p-4 text-center">
              <p className="text-[10px] font-mono uppercase text-jepang-muted">Pemilih Unik</p>
              <p className="font-mono font-black text-3xl mt-1 text-jepang-red">
                {data.uniqueVoters}
              </p>
            </div>
          </div>

          <div className="space-y-6 mb-6">
            {(data.questionStats || []).map((q: any) => (
              <div key={q.id} className="border border-jepang-border p-5">
                <h2 className="font-heading font-bold text-base mb-1">{q.questionText}</h2>
                <p className="text-xs text-jepang-muted mb-4">
                  {q.totalVotes} suara pada pertanyaan ini
                </p>
                <div className="space-y-3">
                  {q.options.map((opt: any) => (
                    <div key={opt.optionId}>
                      <div className="flex justify-between text-sm mb-1 gap-2">
                        <span className="font-medium truncate">{opt.optionText}</span>
                        <span className="font-mono shrink-0">
                          {opt.votes} ({opt.percent}%)
                        </span>
                      </div>
                      <div className="h-2 bg-jepang-border">
                        <div
                          className="h-full bg-jepang-red"
                          style={{ width: `${opt.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border border-jepang-border p-5 mb-6">
            <h2 className="font-heading font-bold text-lg mb-4">Tren Vote per Hari</h2>
            <SimpleBarChart
              data={(data.votesByDay || []).map((d: any) => ({
                label: d.date.slice(5),
                value: d.count,
              }))}
              valueLabel="Vote harian"
            />
          </div>

          {poll.slug && (
            <Link
              href={`/polls/${poll.slug}`}
              className="text-xs font-mono uppercase text-jepang-red hover:underline"
              target="_blank"
            >
              Lihat polling publik →
            </Link>
          )}
        </>
      )}
    </AdminPageShell>
  );
}
