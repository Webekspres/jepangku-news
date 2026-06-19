"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Star, Flame } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { AdminSearchInput, AdminToolbar } from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { THIN_SCROLLBAR_CLASS } from "@/components/ui/thin-scrollbar";
import { cn } from "@/lib/utils";

export default function AdminHomepagePage() {
  const [homepageData, setHomepageData] = useState<any>({
    featured: [],
    hot: [],
  });
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [hp, articles] = await Promise.all([
      fetch("/api/admin/homepage").then((r) => r.json()),
      fetch("/api/admin/articles?status=PUBLISHED").then((r) => r.json()),
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
    } catch {
      toast.error("Gagal memperbarui artikel");
    }
  };

  const filtered = search
    ? allArticles.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase()),
      )
    : allArticles;
    
    // TODO: tambahkan card stats untuk menampilkan total artikel pilihan utama dan hot dan buat UXnya jadi lebih simple agar tidak terlalu banyak scroll
    {/* TODO: perbaiki tampilan border karena header tabel punya warna background border dan roundednya jadi tidak rapih, ituberlaku di semua table admin */}
  return (
    <AdminPageLayout
      testId="admin-homepage-page"
      label="PENGATURAN BERANDA"
      title="Artikel Pilihan & Hot"
      subtitle="Atur artikel yang tampil sebagai pilihan utama di hero dan artikel hot di beranda."
    >
      {loading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminCard title="PILIHAN UTAMA" variant="list" className="border-jepang-red">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 border border-jepang-border"
                  >
                    <SkeletonBox height="1rem" width="12rem" />
                    <SkeletonBox height="1.6rem" width="3rem" />
                  </div>
                ))}
              </div>
            </AdminCard>

            <AdminCard title="HOT" variant="list">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 border border-jepang-border"
                  >
                    <SkeletonBox height="1rem" width="12rem" />
                    <SkeletonBox height="1.6rem" width="3rem" />
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>

          <AdminCard title="SEMUA ARTIKEL" variant="list" noPadding>
            <div className={cn(THIN_SCROLLBAR_CLASS, "divide-y divide-jepang-border max-h-150 overflow-y-auto")}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <SkeletonBox height="1rem" width="60%" />
                  </div>

                  <div className="flex gap-2">
                    <SkeletonBox height="1.6rem" width="5rem" />
                    <SkeletonBox height="1.6rem" width="5rem" />
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminCard
              title={
                <span className="flex items-center gap-2 text-jepang-red">
                  <Star size={20} strokeWidth={1.5} fill="currentColor" />
                  SAAT INI MENJADI PILIHAN UTAMA ({homepageData.featured?.length || 0})
                </span>
              }
              variant="list"
              className="border-jepang-red"
            >
                  {homepageData.featured?.length > 0 ? (
                    <div className="space-y-2">
                      {homepageData.featured.map((a: any) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between p-2 border border-jepang-border"
                          data-testid={`featured-${a.id}`}
                        >
                          <p className="text-sm font-semibold line-clamp-1 flex-1">
                            {a.title}
                          </p>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeatured(a)}
                            className="text-jepang-red hover:text-jepang-red ml-2"
                            data-testid={`unfeature-${a.id}`}
                          >
                            Hapus
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-jepang-muted text-center py-4">
                      Belum ada artikel pilihan utama
                    </p>
                  )}
            </AdminCard>

            <AdminCard
              title={
                <span className="flex items-center gap-2">
                  <Flame size={20} strokeWidth={1.5} className="text-jepang-red" />
                  SAAT INI HOT ({homepageData.hot?.length || 0})
                </span>
              }
              variant="list"
            >
                  {homepageData.hot?.length > 0 ? (
                    <div className="space-y-2">
                      {homepageData.hot.map((a: any) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between p-2 border border-jepang-border"
                          data-testid={`hot-${a.id}`}
                        >
                          <p className="text-sm font-semibold line-clamp-1 flex-1">
                            {a.title}
                          </p>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleHot(a)}
                            className="text-jepang-red hover:text-jepang-red ml-2"
                            data-testid={`unhot-${a.id}`}
                          >
                            Hapus
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-jepang-muted text-center py-4">
                      Belum ada artikel hot
                    </p>
                  )}
            </AdminCard>
          </div>

          <AdminToolbar>
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari artikel..."
              testId="homepage-search"
            />
          </AdminToolbar>

          <AdminCard
            title={`${filtered.length} ARTIKEL YANG DIPUBLIKASIKAN`}
            variant="list"
            noPadding
          >
            <div className={cn(THIN_SCROLLBAR_CLASS, "divide-y divide-jepang-border max-h-150 overflow-y-auto")}>
                  {filtered.map((article: any) => (
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
                            <Flame
                              size={12}
                              strokeWidth={1.5}
                              className="text-jepang-red"
                            />
                          )}

                          {article.category && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-jepang-muted">
                              {article.category.name}
                            </span>
                          )}
                        </div>

                        <p className="font-semibold text-sm truncate">
                          {article.title}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={article.isFeatured ? "default" : "outline"}
                          onClick={() => toggleFeatured(article)}
                          className={
                            article.isFeatured
                              ? ""
                              : "hover:border-jepang-red hover:text-jepang-red"
                          }
                          data-testid={`toggle-featured-${article.id}`}
                        >
                          <Star
                            size={10}
                            strokeWidth={1.5}
                            fill={article.isFeatured ? "currentColor" : "none"}
                          />

                          {article.isFeatured
                            ? "Pilihan Utama"
                            : "Jadikan Pilihan"}
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
                    </div>
                  ))}

                  {filtered.length === 0 && (
                    <p className="text-center text-jepang-muted text-sm p-6">
                      Tidak ada artikel ditemukan
                    </p>
                  )}
            </div>
          </AdminCard>
        </>
      )}
    </AdminPageLayout>
  );
}
