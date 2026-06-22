"use client";
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import ArticleRelatedSection from "@/components/articles/ArticleRelatedSection";
import ArticleSidebarAd from "@/components/articles/ArticleSidebarAd";
import type { Article } from "@/components/ArticleCard";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/media/UserAvatar";

type PublicProfile = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  memberSince: string;
  isContributor: boolean;
  stats: {
    publishedArticles: number;
  };
};

function PublicProfileContent() {
  const { username } = useParams<{ username: string }>()!;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setPage(1);
    void loadProfile(1, true);
  }, [username]);

  const loadProfile = async (pageNum: number, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(
        `/api/profile/${username}?page=${pageNum}&limit=12`,
      );
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProfile(data.profile);
      const incoming = Array.isArray(data.articles) ? data.articles : [];
      if (reset) {
        setArticles(incoming);
        setRelatedArticles(
          Array.isArray(data.relatedArticles) ? data.relatedArticles : [],
        );
      } else {
        setArticles((prev) => {
          const ids = new Set(prev.map((a) => a.id));
          return [...prev, ...incoming.filter((a: Article) => !ids.has(a.id))];
        });
      }
      setHasMore(!!data.hasMore);
      setPage(pageNum);
      setNotFound(false);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white" data-testid="profile-loading">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              <div className="mb-10 flex animate-pulse items-start gap-5 border-b border-jepang-border pb-8">
                <div className="h-20 w-20 shrink-0 rounded-full bg-jepang-border" />
                <div className="flex-1 space-y-3">
                  <div className="h-7 w-40 bg-jepang-border" />
                  <div className="h-4 w-28 bg-jepang-border" />
                  <div className="h-14 max-w-xl bg-jepang-border" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <ArticleCardSkeleton key={i} />
                ))}
              </div>
            </div>
            <aside className="hidden lg:block">
              <div className="h-64 animate-pulse rounded-lg bg-jepang-border" />
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-white"
        data-testid="profile-not-found"
      >
        <div className="px-4 text-center">
          <h1 className="mb-2 font-heading text-3xl font-black tracking-tighter">
            Profil tidak ditemukan
          </h1>
          <p className="mb-6 text-jepang-muted">
            Pengguna @{username} tidak tersedia atau tidak aktif.
          </p>
          <Link href="/articles" className="font-semibold text-jepang-red hover:underline">
            Kembali ke artikel
          </Link>
        </div>
      </div>
    );
  }

  const memberDate = new Date(profile.memberSince).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white" data-testid="public-profile-page">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="mx-auto min-w-0 w-full max-w-4xl lg:mx-0">
            <div className="mb-10 flex items-start gap-5 border-b border-jepang-border pb-8">
              <UserAvatar
                src={profile.avatarUrl}
                alt={profile.displayName}
                size={80}
                fallbackInitial={profile.displayName}
                className="shrink-0 self-start"
                testId={profile.avatarUrl ? "profile-avatar" : "profile-avatar-fallback"}
              />

              <div className="min-w-0 flex-1">
                <h1
                  className="font-heading text-2xl font-black tracking-tighter sm:text-3xl"
                  data-testid="profile-display-name"
                >
                  {profile.displayName}
                </h1>
                <p
                  className="mt-1 font-mono text-sm text-jepang-muted"
                  data-testid="profile-username"
                >
                  @{profile.username}
                </p>

                {profile.bio ? (
                  <p
                    className="mt-4 max-w-2xl text-base leading-relaxed text-jepang-muted"
                    data-testid="profile-bio"
                  >
                    {profile.bio}
                  </p>
                ) : (
                  <p
                    className="mt-4 text-sm italic text-jepang-muted"
                    data-testid="profile-bio-empty"
                  >
                    Belum ada bio.
                  </p>
                )}

                <p className="mt-3 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-jepang-muted">
                  <Calendar size={12} /> Bergabung {memberDate}
                </p>
              </div>
            </div>

            {profile.isContributor && (
              <section data-testid="profile-articles-section">
                <h2 className="mb-6 border-b border-jepang-border pb-3 font-heading text-xl font-black tracking-tighter">
                  Artikel
                  <span className="ml-2 text-jepang-red">
                    ({profile.stats.publishedArticles})
                  </span>
                </h2>

                {articles.length === 0 ? (
                  <p
                    className="py-10 text-center text-jepang-muted"
                    data-testid="profile-no-articles"
                  >
                    Belum ada artikel published.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {articles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={{
                            ...article,
                            author: {
                              name: profile.displayName,
                              username: profile.username,
                            },
                          }}
                        />
                      ))}
                    </div>
                    {hasMore && (
                      <div className="mt-10 text-center">
                        <Button
                          variant="outline"
                          onClick={() => void loadProfile(page + 1)}
                          disabled={loadingMore}
                          data-testid="profile-load-more"
                        >
                          {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
                          <ArrowRight size={14} className="ml-2" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            <ArticleRelatedSection
              embedded
              isLoading={false}
              articles={relatedArticles}
              title="Rekomendasi Artikel"
            />
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ArticleSidebarAd />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-jepang-muted">
          Memuat...
        </div>
      }
    >
      <PublicProfileContent />
    </Suspense>
  );
}
