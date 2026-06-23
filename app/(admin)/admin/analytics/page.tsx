"use client";

import Link from "next/link";
import { parseApiResponse } from '@/lib/fetch-api';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  FileText,
  LayoutGrid,
  Zap,
  MessageSquare,
  Users,
  ArrowRight,
  Calendar,
  TrendingUp,
  Tv,
} from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import AdminStatCards from "@/components/admin/AdminStatCards";

type HubStats = {
  dailyViews: number;
  lifetimeViews: number;
  quizAttempts: number;
  pollVotes: number;
  activeQuizzes: number;
  activePolls: number;
  totalUsers: number;
  activeUsers: number;
};

const DOMAIN_SECTIONS = [
  {
    href: "/admin/analytics/content",
    title: "Performa Artikel",
    desc: "Ranking views, bookmark, dan share per artikel. Klik baris untuk grafik views harian per artikel.",
    icon: FileText,
    statKeys: ["dailyViews", "lifetimeViews"] as const,
    statLabels: ["Views Hari Ini", "Views Lifetime"],
  },
  {
    href: "/admin/analytics/categories",
    title: "Statistik Kategori",
    desc: "Agregat lifetime artikel published per kategori — views, bookmark, share, dan engagement.",
    icon: LayoutGrid,
    statKeys: [] as const,
    statLabels: [],
  },
  {
    href: "/admin/quizzes",
    title: "Statistik Kuis",
    desc: "Daftar kuis dengan attempt dan pass rate. Tombol grafik di setiap baris untuk analytics per kuis.",
    icon: Zap,
    statKeys: ["activeQuizzes", "quizAttempts"] as const,
    statLabels: ["Kuis Aktif", "Total Attempt"],
  },
  {
    href: "/admin/polls",
    title: "Statistik Polling",
    desc: "Daftar polling dengan jumlah suara. Tombol grafik di setiap baris untuk breakdown vote per polling.",
    icon: MessageSquare,
    statKeys: ["activePolls", "pollVotes"] as const,
    statLabels: ["Polling Aktif", "Total Suara"],
  },
  {
    href: "/admin/users",
    title: "Statistik Pengguna",
    desc: "Total pengguna terdaftar, status aktif/diblokir, dan drill-down ke detail profil per user.",
    icon: Users,
    statKeys: ["totalUsers", "activeUsers"] as const,
    statLabels: ["Total Pengguna", "Pengguna Aktif"],
  },
  {
    href: "/admin/videos",
    title: "Jepangku TV",
    desc: "Kelola video YouTube untuk section homepage TV dan halaman /tv. Satu video featured aktif.",
    icon: Tv,
    statKeys: [] as const,
    statLabels: [],
  },
];

export default function AnalyticsHubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<HubStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics/stats")
      .then((r) => parseApiResponse(r))
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && (!user || (user as any).role !== "ADMIN")) router.push("/");
  }, [user, loading, router]);

  if (loading || !user || (user as any).role !== "ADMIN") return null;

  return (
    <AdminPageShell
      title="Analytics Konten"
      subtitle="Pusat laporan performa portal. Ringkasan views di bawah — pilih domain konten untuk drill-down detail."
      label="Analytics"
    >
      <AdminStatCards
        loading={statsLoading}
        skeletonCount={2}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        items={[
          {
            label: "Views Hari Ini",
            value: stats?.dailyViews ?? 0,
            icon: Calendar,
            testId: "stat-views-harian",
          },
          {
            label: "Views Lifetime",
            value: stats?.lifetimeViews ?? 0,
            icon: TrendingUp,
            testId: "stat-views-lifetime",
          },
        ]}
      />

      <div className="mb-8 flex items-center gap-2 text-jepang-muted">
        <BarChart3 size={18} className="text-jepang-red shrink-0" />
        <p className="text-sm">
          Data views harian mulai tercatat setelah fitur analytics aktif. Counter lifetime tetap
          tersedia untuk periode &ldquo;Semua&rdquo;.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOMAIN_SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="group block border border-jepang-border p-6 hover:border-foreground transition-colors"
              data-testid={`analytics-hub-${s.title.replace(/\s+/g, "-").toLowerCase()}`}
            >
              <Icon size={24} className="text-jepang-red mb-3" strokeWidth={1.5} />
              <h2 className="font-heading font-bold text-xl tracking-tight group-hover:text-jepang-red transition-colors">
                {s.title}
              </h2>
              <p className="text-sm text-jepang-muted mt-2 leading-relaxed">{s.desc}</p>
              {s.statKeys.length > 0 && stats && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {s.statKeys.map((key, i) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-jepang-muted"
                    >
                      <span className="font-bold text-foreground tabular-nums">
                        {(stats[key] ?? 0).toLocaleString("id-ID")}
                      </span>
                      {s.statLabels[i]}
                    </span>
                  ))}
                </div>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-jepang-red">
                Buka <ArrowRight size={12} />
              </span>
            </Link>
          );
        })}
      </div>
    </AdminPageShell>
  );
}
