"use client";

import { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

type Entry = {
  rank: number;
  userId: string;
  name: string;
  username: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
};

type QuizLeaderboardProps = {
  slug: string;
};

const PERIOD_OPTIONS = [
  { value: "monthly", label: "Bulan ini" },
  { value: "sepanjang-waktu", label: "Sepanjang waktu" },
] as const;

export default function QuizLeaderboard({ slug }: QuizLeaderboardProps) {
  const [period, setPeriod] = useState<(typeof PERIOD_OPTIONS)[number]["value"]>(
    "monthly",
  );
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/quizzes/${encodeURIComponent(slug)}/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then((d) => setEntries(Array.isArray(d.entries) ? d.entries : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [slug, period]);

  return (
    <Card className="border border-foreground mt-10" data-testid="quiz-leaderboard">
      <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3 flex flex-row items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-jepang-orange" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">
            Peringkat Kuis
          </p>
        </div>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              size="sm"
              variant={period === opt.value ? "default" : "outline"}
              onClick={() => setPeriod(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-jepang-muted" aria-hidden />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-jepang-muted text-center py-10">
            Belum ada peserta di periode ini.
          </p>
        ) : (
          <div className="divide-y divide-jepang-border">
            {entries.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center gap-4 p-4"
                data-testid={`quiz-lb-row-${entry.rank}`}
              >
                <span className="font-mono font-black text-lg w-8 text-jepang-orange">
                  #{entry.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${entry.username}`}
                    className="font-semibold text-sm hover:text-jepang-red transition-colors"
                  >
                    {entry.name}
                  </Link>
                  <p className="text-xs text-jepang-muted font-mono">
                    @{entry.username} · {entry.correctAnswers}/{entry.totalQuestions} benar
                  </p>
                </div>
                <span className="font-mono font-black text-lg">{Math.round(entry.score)}%</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
