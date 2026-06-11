"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import TrendingArticleSkeleton from "@/components/skeletons/TrendingArticleSkeleton";
import PollQuizCardSkeleton from "@/components/skeletons/PollQuizCardSkeleton";
import LeaderboardRowSkeleton from "@/components/skeletons/LeaderboardRowSkeleton";
import CategoryCardSkeleton from "@/components/skeletons/CategoryCardSkeleton";
import SectionHeader from "@/components/SectionHeader";
import AuthorLink from "@/components/AuthorLink";
import LeaderboardAvatar from "@/components/leaderboard/LeaderboardAvatar";
import {
  ArrowRight,
  Trophy,
  Zap,
  MessageSquare,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Author {
  name: string;
  username: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string;
  cover_image_url?: string;
  weeklyViewCount?: number;
  author?: Author;
  category?: Category;
}

interface TrendingArticle extends Article {}

interface Poll {
  id: string;
  slug: string;
  title: string;
  pollType?: string;
  totalVotes: number;
  questionCount: number;
}

interface Quiz {
  id: string;
  slug: string;
  title: string;
  questionCount: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  username: string;
  profileLinked?: boolean;
  avatarUrl?: string | null;
  totalXp: number;
  currentPoints?: number;
  period?: 'all-time';
}

interface CategoryArticle {
  id: string;
  title: string;
  slug: string;
}

interface CategoryWithArticles extends Category {
  articles: CategoryArticle[];
}

export default function HomePage() {
  const router = useRouter();
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [trending, setTrending] = useState<TrendingArticle[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [categories, setCategories] = useState<CategoryWithArticles[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const goPrevFeatured = () => {
    setFeaturedIndex((prev) =>
      prev === 0 ? featuredArticles.length - 1 : prev - 1
    );
  };

  const goNextFeatured = () => {
    setFeaturedIndex((prev) =>
      prev === featuredArticles.length - 1 ? 0 : prev + 1
    );
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearch.trim()) return;
    router.push(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (featuredArticles.length <= 1) return;

    const interval = setInterval(() => {
      setFeaturedIndex((prev) =>
        prev === featuredArticles.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [featuredArticles.length]);

  const loadData = async () => {
    try {
      const response = await fetch("/api/homepage");
      const data = await response.json();

      setFeaturedArticles(data.featuredArticles || []);
      setArticles(data.articles || []);
      setTrending(data.trending || []);
      setPolls(Array.isArray(data.polls) ? data.polls : []);
      setQuizzes(Array.isArray(data.quizzes) ? data.quizzes : []);
      setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (error) {
      console.error("Error loading homepage:", error);
    } finally {
      setLoading(false);
    }
  };

  const latestArticles = articles.slice(0, 6);

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
                  {[...Array(5)].map((_, idx) => (
                    <TrendingArticleSkeleton key={idx} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Banner - Static Content */}
        <SectionHeader
          label="日本のポータル / PORTAL JEPANG"
          title={
            <>
              Berita, Budaya &{" "}
              <span className="text-jepang-red">Hiburan Jepang</span>
            </>
          }
          subtitle="Portal interaktif untuk pembaca Indonesia. Baca, ikuti kuis, voting, dan raih poin!"
          dark
          className="relative border-b border-jepang-black bg-jepang-black overflow-hidden"
        >
          <div className="absolute inset-0">
            <div className="asanoha-bg" />
          </div>
          <div className="mt-6 hidden md:flex justify-end">
            <Link
              href="/sign-up"
              className="jepang-btn-primary"
              data-testid="hero-register-btn cursor-pointer"
            >
              Gabung Sekarang
              <ArrowRight className="inline ml-2" size={16} />
            </Link>
          </div>
        </SectionHeader>

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
              <div className="h-8 bg-jepang-red/10 animate-pulse w-1/4 mb-2" />
              <div className="h-10 bg-jepang-red/10 animate-pulse w-1/3" />
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
      {/* Featured Slider + Trending */}
      <section className="py-12">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {featuredArticles.length > 0 ? (
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{
                      transform: `translateX(-${featuredIndex * 100}%)`,
                    }}
                  >
                    {featuredArticles.map((article: Article, idx: number) => (
                      <div key={article.id} className="w-full shrink-0">
                        <ArticleCard article={article} variant="featured" priority={idx === 0} />
                      </div>
                    ))}
                  </div>

                  {featuredArticles.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goPrevFeatured}
                        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-jepang-black bg-white text-jepang-black transition-colors hover:bg-jepang-black hover:text-white cursor-pointer"
                        aria-label="Artikel sebelumnya"
                      >
                        <ChevronLeft size={20} strokeWidth={1.5} />
                      </button>

                      <button
                        type="button"
                        onClick={goNextFeatured}
                        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-jepang-black bg-white text-jepang-black transition-colors hover:bg-jepang-black hover:text-white cursor-pointer"
                        aria-label="Artikel berikutnya"
                      >
                        <ChevronRight size={20} strokeWidth={1.5} />
                      </button>
                    </>
                  )}
                </div>
              ) : articles.length > 0 ? (
                <ArticleCard article={articles[0]} variant="featured" priority={true} />
              ) : (
                <div className="border border-jepang-border bg-jepang-off-white p-10 text-center text-sm text-jepang-muted">
                  Tidak ada artikel pilihan utama tersedia.
                </div>
              )}
            </div>
            <div className="bg-white border border-jepang-border p-5">
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-jepang-border">
                <div className="flex items-center gap-2">
                  <TrendingUp
                    size={18}
                    strokeWidth={1.5}
                    className="text-jepang-red"
                  />
                  <h3 className="small-caps">Sedang Tren Sekarang</h3>
                </div>
                <Link
                  href="/trending"
                  className="text-[10px] font-mono uppercase tracking-wider text-jepang-muted hover:text-jepang-red transition-colors"
                  data-testid="view-all-trending"
                >
                  Lihat Semua →
                </Link>
              </div>
                <div className="space-y-0">
                  {trending.slice(0, 5).map((article: TrendingArticle, idx: number) => {
                    const thumbnailUrl = article.coverImageUrl || article.cover_image_url;

                    return (
                      <div
                        key={article.id}
                        className="flex items-center gap-3 py-3 border-b border-jepang-border last:border-b-0"
                      >
                        <span className="font-mono font-black text-2xl text-jepang-red">
                          0{idx + 1}
                        </span>
                        <Link
                          href={`/articles/${article.slug}`}
                          className="relative shrink-0 overflow-hidden rounded-sm bg-jepang-off-white w-20 h-16"
                          data-testid={`trending-thumbnail-${article.slug}`}
                        >
                          {thumbnailUrl ? (
                            <Image
                              src={thumbnailUrl}
                              alt={article.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-jepang-muted uppercase tracking-wider">
                              Tidak ada gambar
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/articles/${article.slug}`}
                            className="font-heading font-bold text-sm hover:text-jepang-red transition-colors line-clamp-2"
                            data-testid={`trending-${article.slug}`}
                          >
                            {article.title}
                          </Link>
                          <p className="text-[10px] text-jepang-muted font-mono uppercase tracking-wider mt-1">
                            {article.weeklyViewCount || 0} dilihat minggu ini
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {trending.length === 0 && (
                    <p className="text-sm text-jepang-muted text-center py-8">
                      Belum ada artikel tren
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Hero Banner */}
      <SectionHeader
        label="日本のポータル / PORTAL JEPANG"
        title={
          <>
            Berita, Budaya &{" "}
            <span className="text-jepang-red">Hiburan Jepang</span>
          </>
        }
        subtitle="Portal interaktif untuk pembaca Indonesia. Baca, ikuti kuis, voting, dan raih poin!"
        dark
        className="relative border-b border-jepang-black bg-jepang-black overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="asanoha-bg" />
        </div>
        <form
          onSubmit={handleHeroSearch}
          className="relative mt-6 flex gap-0 max-w-xl"
          data-testid="hero-search-form"
        >
          <input
            type="text"
            placeholder="Cari artikel, topik, atau budaya Jepang..."
            value={heroSearch}
            onChange={(e) => setHeroSearch(e.target.value)}
            className="flex-1 bg-white text-foreground px-4 py-3 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-jepang-red"
            data-testid="hero-search-input"
          />
          <button
            type="submit"
            className="bg-jepang-red text-white px-5 py-3 hover:bg-jepang-red-hover transition-colors shrink-0"
            aria-label="Cari"
            data-testid="hero-search-submit"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>
        </form>
        <div className="mt-4 hidden md:flex justify-end">
          <Link
            href="/sign-up"
            className="jepang-btn-primary"
            data-testid="hero-register-btn"
          >
            Gabung Sekarang
            <ArrowRight className="inline ml-2" size={16} />
          </Link>
        </div>
      </SectionHeader>

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
              {latestArticles.map((article: Article) => (
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
                    {quizzes[0].questionCount || 0} pertanyaan • +10 POIN
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
              leaderboard.slice(0, 5).map((entry: LeaderboardEntry, idx: number) => (
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
                  <LeaderboardAvatar
                    avatarUrl={entry.avatarUrl}
                    displayName={entry.displayName}
                  />
                  <div className="flex-1">
                    <AuthorLink
                      username={entry.profileLinked ? entry.username : null}
                      className="font-semibold block"
                    >
                      {entry.displayName}
                    </AuthorLink>
                    <AuthorLink
                      username={entry.profileLinked ? entry.username : null}
                      className="text-xs text-jepang-muted font-mono block"
                    >
                      @{entry.username}
                    </AuthorLink>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-black text-xl text-jepang-red">
                      {entry.totalXp}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-jepang-muted">
                      POIN
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
      <section className="py-12 bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8 pb-3 border-b-2 border-jepang-black">
            <div>
              <p className="small-caps text-jepang-red mb-1">
                カテゴリ / KATEGORI
              </p>
              <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter">
                Jelajahi Kategori
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat: any) => (
              <div
                key={cat.id}
                className="bg-white border border-jepang-black p-5"
              >
                <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-jepang-border">
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-jepang-red">
                    {cat.name}
                  </h3>

                  <Link
                    href={`/articles?category=${cat.slug}`}
                    className="shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] text-jepang-muted hover:text-jepang-red transition-colors"
                  >
                    Lihat Semua →
                  </Link>
                </div>

                <ul>
                  {cat.articles && cat.articles.length > 0 ? (
                    cat.articles.slice(0, 5).map((article: any, idx: number) => (
                      <li
                        key={article.id}
                        className="grid grid-cols-[28px_1fr] gap-3 py-2.5 border-b border-jepang-border last:border-b-0"
                      >
                        <span className="font-mono text-base font-black leading-5 text-jepang-red">
                          {String(idx + 1).padStart(2, "0")}
                        </span>

                        <Link
                          href={`/articles/${article.slug}`}
                          className="text-[13px] font-semibold leading-5 text-jepang-black hover:text-jepang-red transition-colors line-clamp-2"
                        >
                          {article.title}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="py-8 text-center text-sm text-jepang-muted">
                      Belum ada artikel
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
