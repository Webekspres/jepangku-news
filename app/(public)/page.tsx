"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import TrendingArticleSkeleton from "@/components/skeletons/TrendingArticleSkeleton";
import PollQuizCardSkeleton from "@/components/skeletons/PollQuizCardSkeleton";
import LeaderboardRowSkeleton from "@/components/skeletons/LeaderboardRowSkeleton";
import CategoryCardSkeleton from "@/components/skeletons/CategoryCardSkeleton";
import {
  ArrowRight,
  Trophy,
  Zap,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("/api/homepage");
      const data = await response.json();

      setArticles(data.articles || []);
      setTrending(data.trending || []);
      setPolls(Array.isArray(data.polls) ? data.polls : []);
      setQuizzes(Array.isArray(data.quizzes) ? data.quizzes : []);
      setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (e) {
      console.error("Error loading homepage:", e);
    } finally {
      setLoading(false);
    }
  };

  const featured = articles[0];
  const latestArticles = articles.slice(1, 7);

  if (loading) {
    return (
      <div className="bg-white" data-testid="homepage-loading">
        {/* Featured + Trending Skeleton */}
        <section className="py-12">
          <div className="px-4 mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ArticleCardSkeleton variant="featured" />
              </div>
              <div className="bg-white border border-jepang-border p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-jepang-border">
                  <TrendingUp
                    size={18}
                    strokeWidth={1.5}
                    className="text-jepang-red"
                  />
                  <h3 className="small-caps">Sedang Tren Sekarang</h3>
                </div>
                <div className="space-y-0">
                  {[...Array(4)].map((_, idx) => (
                    <TrendingArticleSkeleton key={idx} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Banner - Static Content */}
        <section className="relative border-b border-jepang-black bg-jepang-black overflow-hidden">
          <div className="asanoha-bg" />
          <div className="relative py-8 md:py-12">
            <div className="px-4 mx-auto max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2">
                  <p className="small-caps text-jepang-red mb-3">
                    日本のポータル / PORTAL JEPANG
                  </p>
                  <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-white mb-3">
                    Berita, Budaya &{" "}
                    <span className="text-jepang-red">Hiburan Jepang</span>
                  </h1>
                  <p className="text-zinc-300 text-base md:text-lg max-w-2xl">
                    Portal interaktif untuk pembaca Indonesia. Baca, ikuti quiz,
                    vote, dan raih poin!
                  </p>
                </div>
                <div className="hidden md:flex justify-end">
                  <Link
                    href="/register"
                    className="jepang-btn-primary"
                    data-testid="hero-register-btn"
                  >
                    Gabung Sekarang
                    <ArrowRight className="inline ml-2" size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Articles Skeleton */}
        <section className="py-12 bg-jepang-off-white">
          <div className="px-4 mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-8 pb-3 border-b-2 border-jepang-black">
              <div>
                <p className="small-caps text-jepang-red mb-1">
                  最新 / TERBARU
                </p>
                <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter">
                  Artikel Terbaru
                </h2>
              </div>
              <Link
                href="/articles"
                className="hidden md:inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider hover:text-jepang-red transition-colors"
                data-testid="view-all-articles"
              >
                Lihat Semua <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, idx) => (
                <ArticleCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        </section>

        {/* Polls + Quiz Skeleton */}
        <section className="py-12">
          <div className="px-4 mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-jepang-black">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-jepang-border px-6 pt-6">
                  <MessageSquare
                    size={18}
                    strokeWidth={1.5}
                    className="text-jepang-red"
                  />
                  <h3 className="small-caps">Poll Aktif</h3>
                </div>
                <div className="px-6 pb-6">
                  <PollQuizCardSkeleton />
                </div>
              </div>
              <div className="bg-jepang-black text-white border border-jepang-black">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-700 px-6 pt-6">
                  <Zap
                    size={18}
                    strokeWidth={1.5}
                    className="text-jepang-red"
                  />
                  <h3 className="small-caps text-jepang-red">
                    Uji Pengetahuanmu
                  </h3>
                </div>
                <div className="px-6 pb-6">
                  <PollQuizCardSkeleton isDark />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard Skeleton */}
        <section className="py-12 bg-jepang-off-white">
          <div className="px-4 mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-8 pb-3 border-b-2 border-jepang-black">
              <div>
                <p className="small-caps text-jepang-red mb-1">
                  ランキング / PERINGKAT
                </p>
                <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter flex items-center gap-3">
                  <Trophy
                    size={32}
                    strokeWidth={1.5}
                    className="text-jepang-red"
                  />{" "}
                  Papan Peringkat Mingguan
                </h2>
              </div>
              <Link
                href="/leaderboard"
                className="hidden md:inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider hover:text-jepang-red transition-colors"
                data-testid="view-full-leaderboard"
              >
                SEMUA PERINGKAT <ArrowRight size={14} />
              </Link>
            </div>
            <div className="bg-white border border-jepang-black">
              {[...Array(5)].map((_, idx) => (
                <LeaderboardRowSkeleton key={idx} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories Skeleton */}
        <section className="py-12">
          <div className="px-4 mx-auto max-w-7xl">
            <div className="mb-8">
              <div className="h-8 bg-jepang-red/10 rounded animate-pulse w-1/4 mb-2" />
              <div className="h-10 bg-jepang-red/10 rounded animate-pulse w-1/3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[...Array(5)].map((_, idx) => (
                <CategoryCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white" data-testid="homepage">
      {/* Featured Article + Trending */}
      {featured && (
        <section className="py-12">
          <div className="px-4 mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ArticleCard article={featured} variant="featured" />
              </div>
              <div className="bg-white border border-jepang-border p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-jepang-border">
                  <TrendingUp
                    size={18}
                    strokeWidth={1.5}
                    className="text-jepang-red"
                  />
                  <h3 className="small-caps">Sedang Tren Sekarang</h3>
                </div>
                <div className="space-y-0">
                  {trending.slice(0, 4).map((article: any, idx: number) => (
                    <div
                      key={article.id}
                      className="flex gap-3 py-3 border-b border-jepang-border last:border-b-0"
                    >
                      <span className="font-mono font-black text-2xl text-jepang-red">
                        0{idx + 1}
                      </span>
                      <div className="flex-1">
                        <Link
                          href={`/articles/${article.slug}`}
                          className="font-heading font-bold text-sm hover:text-jepang-red transition-colors line-clamp-2"
                          data-testid={`trending-${article.slug}`}
                        >
                          {article.title}
                        </Link>
                        <p className="text-[10px] text-jepang-muted font-mono uppercase tracking-wider mt-1">
                          {article.viewCount || 0} VIEWS
                        </p>
                      </div>
                    </div>
                  ))}
                  {trending.length === 0 && (
                    <p className="text-sm text-jepang-muted text-center py-8">
                      No trending articles yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hero Banner */}
      <section className="relative border-b border-jepang-black bg-jepang-black overflow-hidden">
        <div className="asanoha-bg" />
        <div className="relative py-8 md:py-12">
          <div className="px-4 mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2">
                <p className="small-caps text-jepang-red mb-3">
                  日本のポータル / PORTAL JEPANG
                </p>
                <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-white mb-3">
                  Berita, Budaya &{" "}
                  <span className="text-jepang-red">Hiburan Jepang</span>
                </h1>
                <p className="text-zinc-300 text-base md:text-lg max-w-2xl">
                  Portal interaktif untuk pembaca Indonesia. Baca, ikuti quiz,
                  vote, dan raih poin!
                </p>
              </div>
              <div className="hidden md:flex justify-end">
                <Link
                  href="/register"
                  className="jepang-btn-primary"
                  data-testid="hero-register-btn"
                >
                  Gabung Sekarang
                  <ArrowRight className="inline ml-2" size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles Grid */}
      <section className="py-12 bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8 pb-3 border-b-2 border-jepang-black">
            <div>
              <p className="small-caps text-jepang-red mb-1">最新 / TERBARU</p>
              <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter">
                Artikel Terbaru
              </h2>
            </div>
            <Link
              href="/articles"
              className="hidden md:inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider hover:text-jepang-red transition-colors"
              data-testid="view-all-articles"
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
          {latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((article: any) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-center text-jepang-muted py-12">
              Belum ada artikel. Segera periksa kembali!
            </p>
          )}
        </div>
      </section>

      {/* Interactive Section: Polls + Quiz */}
      <section className="py-12">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-jepang-black p-6 hard-shadow-red">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-jepang-border">
                <MessageSquare
                  size={18}
                  strokeWidth={1.5}
                  className="text-jepang-red"
                />
                <h3 className="small-caps">Poll Aktif</h3>
              </div>
              {polls.length > 0 ? (
                <div>
                  <span className="jepang-badge mb-3">
                    {polls[0].pollType?.toUpperCase()}
                  </span>
                  <h4 className="font-heading font-bold text-2xl tracking-tight mb-3 mt-3">
                    {polls[0].title}
                  </h4>
                  <p className="text-sm text-jepang-muted mb-4">
                    {polls[0].totalVotes || 0} votes
                  </p>
                  <Link
                    href={`/polls/${polls[0].slug}`}
                    className="jepang-btn-primary inline-block"
                    data-testid="homepage-poll-cta"
                  >
                    Pilih Sekarang
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-jepang-muted py-8 text-center">
                  Tidak ada jajak pendapat aktif. Segera periksa kembali!
                </p>
              )}
            </div>

            <div className="bg-jepang-black text-white p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-700">
                <Zap size={18} strokeWidth={1.5} className="text-jepang-red" />
                <h3 className="small-caps text-jepang-red">
                  Uji Pengetahuanmu
                </h3>
              </div>
              {quizzes.length > 0 ? (
                <div>
                  <span className="jepang-badge-red mb-3">KUIS</span>
                  <h4 className="font-heading font-bold text-2xl tracking-tight mb-3 mt-3">
                    {quizzes[0].title}
                  </h4>
                  <p className="text-sm text-zinc-400 mb-4">
                    {quizzes[0].questionCount || 0} questions • +10 PTS
                  </p>
                  <Link
                    href={`/quizzes/${quizzes[0].slug}`}
                    className="jepang-btn-primary inline-block"
                    data-testid="homepage-quiz-cta"
                  >
                    MULAI KUIS
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-zinc-400 py-8 text-center">
                  Belum ada kuis yang tersedia.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-12 bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8 pb-3 border-b-2 border-jepang-black">
            <div>
              <p className="small-caps text-jepang-red mb-1">
                ランキング / PERINGKAT
              </p>
              <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter flex items-center gap-3">
                <Trophy
                  size={32}
                  strokeWidth={1.5}
                  className="text-jepang-red"
                />{" "}
                Papan Peringkat Mingguan
              </h2>
            </div>
            <Link
              href="/leaderboard"
              className="hidden md:inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider hover:text-jepang-red transition-colors"
              data-testid="view-full-leaderboard"
            >
              SEMUA PERINGKAT <ArrowRight size={14} />
            </Link>
          </div>
          <div className="bg-white border border-jepang-black">
            {leaderboard.length > 0 ? (
              leaderboard.slice(0, 5).map((entry: any, idx: number) => (
                <div
                  key={entry.userId}
                  className="flex items-center gap-4 px-6 py-4 border-b border-jepang-border last:border-b-0"
                  data-testid={`leaderboard-row-${idx}`}
                >
                  <span
                    className={`font-mono font-black text-2xl w-10 ${idx === 0 ? "text-jepang-red" : "text-jepang-black"}`}
                  >
                    #{entry.rank}
                  </span>
                  <div className="w-10 h-10 bg-jepang-black text-white flex items-center justify-center font-bold">
                    {entry.displayName?.charAt(0).toUpperCase() || "J"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{entry.displayName}</p>
                    <p className="text-xs text-jepang-muted font-mono">
                      @{entry.username}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-black text-xl text-jepang-red">
                      {entry.weeklyPoints}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-jepang-muted">
                      PTS
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-jepang-muted py-12">
                Belum ada data peringkat. Jadilah yang pertama!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="mb-8 pb-3 border-b-2 border-jepang-black">
            <p className="small-caps text-jepang-red mb-1">
              カテゴリ / KATEGORI
            </p>
            <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter">
              Jelajahi Kategori
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/articles?category=${cat.slug}`}
                className="block p-4 border border-jepang-border hover:border-jepang-black hover:bg-jepang-black hover:text-white transition-all group"
                data-testid={`category-${cat.slug}`}
              >
                <p className="font-heading font-bold text-lg group-hover:text-white transition-colors">
                  {cat.name}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-jepang-muted group-hover:text-zinc-400 mt-1">
                  JELAJAHI →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
