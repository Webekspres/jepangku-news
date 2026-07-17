"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import { toast } from "sonner";
import { Star, Flame, List } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminStatCards from "@/components/admin/AdminStatCards";
import { AdminSearchInput, AdminToolbar } from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { THIN_SCROLLBAR_CLASS } from "@/components/ui/thin-scrollbar";
import { cn } from "@/lib/utils";

type TabId = "articles" | "featured" | "populer";

const TABS: { id: TabId; label: string; icon: typeof List }[] = [
  { id: "articles", label: "Semua Artikel", icon: List },
  { id: "featured", label: "Pilihan Utama", icon: Star },
  { id: "populer", label: "Populer", icon: Flame },
];

export default function AdminHomepagePage() {
  const [homepageData, setHomepageData] = useState<any>({
    featured: [],
    hot: [],
  });
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("articles");
  const [stats, setStats] = useState<{ featured: number; hot: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/homepage/stats")
      .then((r) => parseApiResponse(r))
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [hp, articles] = await Promise.all([
      fetch("/api/admin/homepage").then((r) => parseApiResponse(r)),
      fetch("/api/admin/articles?status=PUBLISHED").then((r) => parseApiResponse(r)),
    ]);

    setHomepageData(hp);
    setAllArticles(Array.isArray(articles) ? articles : []);
    setLoading(false);
  };

  const toggleFeatured = async (article: any) => {
    try {
      await fetch(`/api/admin/articles/${article.id}/featured`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: !article.isFeatured }),
      });

      toast.success(
        article.isFeatured
          ? "Artikel dihapus dari pilihan utama"
          : "Artikel ditambahkan ke pilihan utama",
      );

      loadData();
      fetch("/api/admin/homepage/stats")
        .then((r) => parseApiResponse(r))
        .then(setStats);
    } catch {
      toast.error("Gagal memperbarui artikel");
    }
  };

  const toggleHot = async (article: any) => {
    try {
      await fetch(`/api/admin/articles/${article.id}/hot`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: !article.isHot }),
      });

      toast.success(
        article.isHot
          ? "Artikel dihapus dari daftar hot"
          : "Artikel ditandai sebagai hot",
      );

      loadData();
      fetch("/api/admin/homepage/stats")
        .then((r) => parseApiResponse(r))
        .then(setStats);
    } catch {
      toast.error("Gagal memperbarui artikel");
    }
  };

  const filtered = search
    ? allArticles.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase()),
      )
    : allArticles;

  const renderArticleRow = (article: any, showToggles = true) => (
    <div
      key={article.id}
      className="p-3 flex items-center justify-between gap-3 hover:bg-jepang-off-white"
      data-testid={`homepage-article-${article.id}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {article.isFeatured && (
            <Star
              size={12}
              strokeWidth={1.5}
              className="text-jepang-red"
              fill="currentColor"
            />
          )}
          {article.isHot && (
            <Flame size={12} strokeWidth={1.5} className="text-jepang-red" />
          )}
          {article.category && (
            <span className="text-[10px] uppercase tracking-wider font-bold text-jepang-muted">
              {article.category.name}
            </span>
          )}
        </div>
        <p className="font-semibold text-sm truncate">{article.title}</p>
      </div>

      {showToggles ? (
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant={article.isFeatured ? "default" : "outline"}
            onClick={() => toggleFeatured(article)}
            className={
              article.isFeatured ? "" : "hover:border-jepang-red hover:text-jepang-red"
            }
            data-testid={`toggle-featured-${article.id}`}
          >
            <Star
              size={10}
              strokeWidth={1.5}
              fill={article.isFeatured ? "currentColor" : "none"}
            />
            {article.isFeatured ? "Pilihan Utama" : "Jadikan Pilihan"}
          </Button>
          <Button
            size="sm"
            variant={article.isHot ? "default" : "outline"}
            onClick={() => toggleHot(article)}
            data-testid={`toggle-hot-${article.id}`}
          >
            <Flame size={10} strokeWidth={1.5} /> Populer
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            activeTab === "featured" ? toggleFeatured(article) : toggleHot(article)
          }
          className="text-jepang-red hover:text-jepang-red shrink-0"
          data-testid={
            activeTab === "featured"
              ? `unfeature-${article.id}`
              : `unhot-${article.id}`
          }
        >
          Hapus
        </Button>
      )}
    </div>
  );

  const tabArticles =
    activeTab === "featured"
      ? homepageData.featured ?? []
      : activeTab === "populer"
        ? homepageData.hot ?? []
        : filtered;

  const tabTitle =
    activeTab === "featured"
      ? `PILIHAN UTAMA (${homepageData.featured?.length || 0})`
      : activeTab === "populer"
        ? `HOT (${homepageData.hot?.length || 0})`
        : `${filtered.length} ARTIKEL YANG DIPUBLIKASIKAN`;

  return (
    <AdminPageLayout
      testId="admin-homepage-page"
      label="PENGATURAN BERANDA"
      title="Artikel Pilihan & Populer"
      subtitle="Atur artikel yang tampil sebagai pilihan utama di hero dan artikel populer di beranda."
    >
      <AdminStatCards
        loading={statsLoading}
        skeletonCount={2}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
        items={[
          {
            label: "Pilihan Utama",
            value: stats?.featured ?? homepageData.featured?.length ?? 0,
            icon: Star,
            onClick: () => setActiveTab("featured"),
            testId: "stat-pilihan-utama",
          },
          {
            label: "Artikel Populer",
            value: stats?.hot ?? homepageData.hot?.length ?? 0,
            icon: Flame,
            highlight: true,
            onClick: () => setActiveTab("populer"),
            testId: "stat-artikel-hot",
          },
        ]}
      />
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const count =
            tab.id === "featured"
              ? homepageData.featured?.length || 0
              : tab.id === "populer"
                ? homepageData.hot?.length || 0
                : allArticles.length;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              data-testid={`homepage-tab-${tab.id}`}
            >
              <Icon size={14} className="mr-1.5" />
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">({count})</span>
            </Button>
          );
        })}
      </div>

      {activeTab === "articles" && (
        <AdminToolbar>
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari artikel..."
            testId="homepage-search"
          />
        </AdminToolbar>
      )}

      <AdminCard
        title={tabTitle}
        variant="list"
        noPadding
        className={activeTab === "featured" ? "border-jepang-red" : undefined}
      >
        {loading ? (
          <div className="divide-y divide-jepang-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 flex items-center justify-between gap-3">
                <SkeletonBox height="1rem" width="60%" />
                <SkeletonBox height="1.6rem" width="8rem" />
              </div>
            ))}
          </div>
        ) : tabArticles.length === 0 ? (
          <p className="text-center text-jepang-muted text-sm p-6">
            {activeTab === "featured"
              ? "Belum ada artikel pilihan utama"
              : activeTab === "populer"
                ? "Belum ada artikel populer"
                : "Tidak ada artikel ditemukan"}
          </p>
        ) : (
          <div
            className={cn(
              THIN_SCROLLBAR_CLASS,
              "divide-y divide-jepang-border max-h-112 overflow-y-auto",
            )}
          >
            {tabArticles.map((article: any) =>
              renderArticleRow(article, activeTab === "articles"),
            )}
          </div>
        )}
      </AdminCard>
    </AdminPageLayout>
  );
}
