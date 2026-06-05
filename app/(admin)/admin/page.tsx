"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  FileText,
  Users,
  Zap,
  MessageSquare,
  Eye,
  CheckSquare,
  Tag,
  Home,
  LayoutGrid,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SectionHeader from "@/components/SectionHeader";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [pendingArticles, setPendingArticles] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || (user as any).role !== "ADMIN")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || (user as any).role !== "ADMIN") return;

    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/articles/pending").then((r) => r.json()),
    ]).then(([s, p]) => {
      setStats(s);
      setPendingArticles(Array.isArray(p) ? p.slice(0, 5) : []);
    });
  }, [user]);

  if (loading || !user || (user as any).role !== "ADMIN") return null;

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
    <div className="bg-white min-h-screen" data-testid="admin-dashboard">
      <SectionHeader
        label="管理 / ADMIN"
        title="Dashboard Admin"
        subtitle="Kelola portal Jepangku"
        className="border-b-2 border-foreground bg-foreground text-white"
        data-testid="admin-dashboard-header"
      />

      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {!stats
            ? [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-5 border bg-white">
                  <SkeletonBox height="1rem" width="30%" className="mb-3" />
                  <div className="my-3">
                    <SkeletonBox height="2rem" width="100%" />
                  </div>
                  <SkeletonBox height="0.6rem" width="60%" />
                </div>
              ))
            : statCards.map((stat, idx) => {
                const Icon = stat.icon;

                return (
                  <Link
                    key={idx}
                    href={stat.link}
                    className={`block p-5 border transition-colors ${
                      (stat as any).highlight
                        ? "bg-jepang-red text-white border-jepang-red hover:opacity-90"
                        : "bg-white border-jepang-border hover:border-foreground"
                    }`}
                    data-testid={`stat-${stat.label
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <Icon size={20} strokeWidth={1.5} className="mb-3" />

                    <p className="font-mono font-black text-3xl">
                      {stat.value}
                    </p>

                    <p className="text-[10px] uppercase tracking-wider font-bold mt-1">
                      {stat.label}
                    </p>
                  </Link>
                );
              })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            {
              href: "/admin/users",
              icon: Users,
              label: "Kelola Pengguna",
              testid: "action-manage-users",
            },
            {
              href: "/admin/tags",
              icon: Tag,
              label: "Kelola Tag",
              testid: "action-manage-tags",
            },
            {
              href: "/admin/categories",
              icon: LayoutGrid,
              label: "Kelola Kategori",
              testid: "action-manage-categories",
            },
            {
              href: "/admin/homepage",
              icon: Home,
              label: "Pengaturan Beranda",
              testid: "action-manage-homepage",
            },
            {
              href: "/admin/comments",
              icon: MessageSquare,
              label: "Moderasi Komentar",
              testid: "action-manage-comments",
            },
            {
              href: "/admin/articles",
              icon: FileText,
              label: "Semua Artikel",
              testid: "action-manage-articles",
            },
            {
              href: "/admin/analytics",
              icon: BarChart3,
              label: "Analytics Konten",
              testid: "action-analytics",
            },
          ].map(({ href, icon: Icon, label, testid }) => (
            <Link
              key={href}
              href={href}
              className="border border-jepang-border hover:border-foreground p-4 transition-colors flex flex-col items-center text-center"
              data-testid={testid}
            >
              <Icon size={20} strokeWidth={1.5} className="mb-2" />

              <p className="text-xs font-bold uppercase tracking-wider">
                {label}
              </p>
            </Link>
          ))}
        </div>

        <Card className="border border-foreground">
          <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3 flex flex-row items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              ARTIKEL MENUNGGU REVIEW TERBARU
            </p>

            <Link
              href="/admin/articles/review"
              className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline"
              data-testid="view-all-pending"
            >
              Lihat Semua →
            </Link>
          </CardHeader>

          <CardContent className="p-0">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
