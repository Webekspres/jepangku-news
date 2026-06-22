"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Users,
  Zap,
  MessageSquare,
  Eye,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminStatCards from "@/components/admin/AdminStatCards";
import DashboardCharts from "@/components/admin/DashboardCharts";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [pendingArticles, setPendingArticles] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/articles/pending").then((r) => r.json()),
    ]).then(([s, p]) => {
      setStats(s);
      setPendingArticles(Array.isArray(p) ? p.slice(0, 5) : []);
    });
  }, [user]);

  const statCards = [
    {
      label: "Total Artikel",
      value: stats?.totalArticles || 0,
      icon: FileText,
      link: "/admin/articles",
    },
    {
      label: "Menunggu Review",
      value: stats?.pendingArticles || 0,
      icon: CheckSquare,
      link: "/admin/articles/review",
      highlight: true,
    },
    {
      label: "Dipublikasikan",
      value: stats?.publishedArticles || 0,
      icon: Eye,
      link: "/admin/articles",
    },
    {
      label: "Total Pengguna",
      value: stats?.totalUsers || 0,
      icon: Users,
      link: "/admin/users",
    },
    {
      label: "Kuis",
      value: stats?.totalQuizzes || 0,
      icon: Zap,
      link: "/admin/quizzes",
    },
    {
      label: "Polling",
      value: stats?.totalPolls || 0,
      icon: MessageSquare,
      link: "/admin/polls",
    },
  ];

  return (
    <AdminPageLayout
      testId="admin-dashboard"
      title="Dashboard"
      subtitle="Ringkasan portal Jepangku Berita"
    >
        <AdminStatCards
          loading={!stats}
          skeletonCount={6}
          items={statCards.map((stat) => ({
            label: stat.label,
            value: stat.value,
            icon: stat.icon,
            highlight: stat.highlight,
            href: stat.link,
          }))}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/articles/create"
            className="bg-foreground text-white p-6 hover:opacity-90 transition-opacity"
            data-testid="action-create-article"
          >
            <FileText size={28} strokeWidth={1.5} className="mb-3" />
            <p className="font-heading font-bold text-xl">Buat Artikel</p>
            <p className="text-sm opacity-80 mt-1">Konten redaksi, publish langsung</p>
          </Link>

          <Link
            href="/admin/articles/review"
            className="bg-jepang-red text-white p-6 hover:opacity-90 transition-opacity"
            data-testid="action-review"
          >
            <CheckSquare size={28} strokeWidth={1.5} className="mb-3" />

            <p className="font-heading font-bold text-xl">Review Artikel</p>

            <p className="text-sm opacity-80 mt-1">
              {stats?.pendingArticles || 0} artikel menunggu review
            </p>
          </Link>

          <Link
            href="/admin/quizzes/create"
            className="bg-foreground text-white p-6 hover:opacity-90 transition-opacity"
            data-testid="action-create-quiz"
          >
            <Zap size={28} strokeWidth={1.5} className="mb-3" />

            <p className="font-heading font-bold text-xl">Buat Kuis</p>

            <p className="text-sm opacity-80 mt-1">Tambah kuis trivia baru</p>
          </Link>

          <Link
            href="/admin/polls/create"
            className="bg-white border border-foreground p-6 hover:bg-jepang-off-white transition-colors"
            data-testid="action-create-poll"
          >
            <MessageSquare size={28} strokeWidth={1.5} className="mb-3" />

            <p className="font-heading font-bold text-xl">Buat Polling</p>

            <p className="text-sm text-jepang-muted mt-1">
              Tambah polling atau voting
            </p>
          </Link>
        </div>

        <DashboardCharts charts={stats?.charts ?? null} loading={!stats} />

        <AdminCard
          variant="list"
          title="ARTIKEL MENUNGGU REVIEW TERBARU"
          noPadding
          headerAction={
            <Link
              href="/admin/articles/review"
              className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline"
              data-testid="view-all-pending"
            >
              Lihat Semua →
            </Link>
          }
        >
            {pendingArticles.length === 0 && stats ? (
              <p className="p-6 text-center text-jepang-muted text-sm">
                Tidak ada artikel yang menunggu review
              </p>
            ) : !stats ? (
              <div className="divide-y divide-jepang-border">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <SkeletonBox height="1rem" width="60%" />
                      <div className="mt-2">
                        <SkeletonBox height="0.8rem" width="40%" />
                      </div>
                    </div>

                    <SkeletonBox height="1.6rem" width="4rem" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-jepang-border">
                {pendingArticles.map((article: any) => (
                  <div
                    key={article.id}
                    className="p-4 flex items-center gap-4"
                    data-testid={`pending-${article.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{article.title}</h3>

                      <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
                        OLEH {article.author?.name} •{" "}
                        {new Date(article.createdAt).toLocaleDateString(
                          "id-ID",
                        )}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      data-testid={`review-${article.id}`}
                    >
                      <Link href="/admin/articles/review">Tinjau</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
        </AdminCard>
    </AdminPageLayout>
  );
}
