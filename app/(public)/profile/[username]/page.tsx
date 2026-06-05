"use client";
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import SectionHeader from "@/components/SectionHeader";
import { Eye, Bookmark, FileText, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PublicProfile = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  memberSince: string;
  stats: {
    publishedArticles: number;
    totalViews: number;
    totalBookmarks: number;
  };
};

function PublicProfileContent() {
  const { username } = useParams<{ username: string }>()!;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setPage(1);
    loadProfile(1, true);
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
      if (reset) setArticles(incoming);
      else {
        setArticles((prev) => {
          const ids = new Set(prev.map((a) => a.id));
          return [...prev, ...incoming.filter((a: any) => !ids.has(a.id))];
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
      <div className="bg-white min-h-screen" data-testid="profile-loading">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <div className="flex gap-6 mb-12 animate-pulse">
            <div className="h-24 w-24 bg-jepang-border shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 bg-jepang-border" />
              <div className="h-4 w-32 bg-jepang-border" />
              <div className="h-16 w-full max-w-xl bg-jepang-border" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center" data-testid="profile-not-found">
        <div className="text-center px-4">
          <h1 className="font-heading font-black text-3xl tracking-tighter mb-2">
            Profil tidak ditemukan
          </h1>
          <p className="text-jepang-muted mb-6">
            Pengguna @{username} tidak tersedia atau tidak aktif.
          </p>
          <Link href="/articles" className="text-jepang-red font-semibold hover:underline">
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
    <div className="bg-white min-h-screen" data-testid="public-profile-page">
      <SectionHeader
        label="著者 / Penulis"
        title={profile.displayName}
        subtitle={`@${profile.username}`}
      />

      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="flex flex-col sm:flex-row gap-6 mb-10 pb-8 border-b-2 border-foreground">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-24 w-24 shrink-0 border-2 border-foreground object-cover"
              data-testid="profile-avatar"
            />
          ) : (
            <div
              className="flex h-24 w-24 shrink-0 items-center justify-center border-2 border-foreground bg-foreground text-3xl font-bold text-white"
              data-testid="profile-avatar-fallback"
            >
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            {profile.bio ? (
              <p className="text-base leading-relaxed text-jepang-muted max-w-2xl" data-testid="profile-bio">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm italic text-jepang-muted" data-testid="profile-bio-empty">
                Penulis belum menambahkan bio.
              </p>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-jepang-muted">
              <Calendar size={12} /> Bergabung {memberDate}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12 max-w-lg" data-testid="profile-stats">
          <div className="border border-jepang-border p-4 text-center">
            <FileText size={18} className="mx-auto mb-2 text-jepang-red" strokeWidth={1.5} />
            <p className="font-mono font-black text-2xl">{profile.stats.publishedArticles}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-jepang-muted mt-1">
              Artikel
            </p>
          </div>
          <div className="border border-jepang-border p-4 text-center">
            <Eye size={18} className="mx-auto mb-2 text-jepang-red" strokeWidth={1.5} />
            <p className="font-mono font-black text-2xl">{profile.stats.totalViews}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-jepang-muted mt-1">
              Views
            </p>
          </div>
          <div className="border border-jepang-border p-4 text-center">
            <Bookmark size={18} className="mx-auto mb-2 text-jepang-red" strokeWidth={1.5} />
            <p className="font-mono font-black text-2xl">{profile.stats.totalBookmarks}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-jepang-muted mt-1">
              Bookmark
            </p>
          </div>
        </div>

        <h2 className="font-heading font-black text-2xl tracking-tighter mb-6 pb-3 border-b border-jepang-border">
          Artikel Published
          <span className="text-jepang-red ml-2">({profile.stats.publishedArticles})</span>
        </h2>

        {articles.length === 0 ? (
          <p className="text-center text-jepang-muted py-12" data-testid="profile-no-articles">
            Belum ada artikel published.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  onClick={() => loadProfile(page + 1)}
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
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-jepang-muted">
          Memuat...
        </div>
      }
    >
      <PublicProfileContent />
    </Suspense>
  );
}
