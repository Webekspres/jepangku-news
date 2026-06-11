"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Star, Flame, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { THIN_SCROLLBAR_CLASS } from "@/components/ui/thin-scrollbar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

  return (
    <div className="bg-white min-h-screen" data-testid="admin-homepage-page">
      <section className="border-b border-jepang-border bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
            PENGATURAN BERANDA
          </p>

          <h1 className="font-heading font-black text-4xl tracking-tighter">
            Artikel Pilihan & Hot
          </h1>

          <p className="text-jepang-muted mt-2">
            Atur artikel yang tampil sebagai pilihan utama di hero dan artikel
            hot di beranda.
          </p>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8">
        {loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="border border-jepang-red">
                <CardHeader className="border-b border-jepang-border py-3">
                  <div className="flex items-center gap-2">
                    <SkeletonBox height="1rem" width="8rem" />
                  </div>
                </CardHeader>

                <CardContent className="pt-3">
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 border border-jepang-border"
                      >
                        <SkeletonBox height="1rem" width="12rem" />
                        <SkeletonBox height="1.6rem" width="3rem" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-foreground">
                <CardHeader className="border-b border-jepang-border py-3">
                  <div className="flex items-center gap-2">
                    <SkeletonBox height="1rem" width="8rem" />
                  </div>
                </CardHeader>

                <CardContent className="pt-3">
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 border border-jepang-border"
                      >
                        <SkeletonBox height="1rem" width="12rem" />
                        <SkeletonBox height="1.6rem" width="3rem" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-foreground">
              <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
                <div className="flex items-center justify-between gap-4">
                  <SkeletonBox height="1rem" width="10rem" />

                  <div className="relative flex-1 max-w-xs">
                    <SkeletonBox height="2rem" width="10rem" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
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
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="border border-jepang-red">
                <CardHeader className="border-b border-jepang-border py-3">
                  <div className="flex items-center gap-2">
                    <Star
                      size={20}
                      strokeWidth={1.5}
                      className="text-jepang-red"
                      fill="currentColor"
                    />

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red">
                      SAAT INI MENJADI PILIHAN UTAMA (
                      {homepageData.featured?.length || 0})
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="pt-3">
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
                </CardContent>
              </Card>

              <Card className="border border-foreground">
                <CardHeader className="border-b border-jepang-border py-3">
                  <div className="flex items-center gap-2">
                    <Flame
                      size={20}
                      strokeWidth={1.5}
                      className="text-jepang-red"
                    />

                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                      SAAT INI HOT ({homepageData.hot?.length || 0})
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="pt-3">
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
                </CardContent>
              </Card>
            </div>

            <Card className="border border-foreground">
              <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                    SEMUA ARTIKEL YANG DIPUBLIKASIKAN
                  </p>

                  <div className="relative flex-1 max-w-xs">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-jepang-muted"
                    />

                    <Input
                      type="text"
                      placeholder="Cari artikel..."
                      className="pl-8 text-sm py-2"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      data-testid="homepage-search"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
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
                          variant={article.isHot ? "black" : "outline"}
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
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
