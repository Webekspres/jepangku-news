"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import TrendingArticleSkeleton from "@/components/skeletons/TrendingArticleSkeleton";
import LeaderboardRowSkeleton from "@/components/skeletons/LeaderboardRowSkeleton";
import AuthorLink from "@/components/AuthorLink";
import LeaderboardAvatar from "@/components/leaderboard/LeaderboardAvatar";
import HomeHero from "@/components/home/HomeHero";
import HomePlaceholderSection from "@/components/home/HomePlaceholderSection";
import LazySectionShell from "@/components/home/LazySectionShell";
import {
  ArrowRight,
  Trophy,
  Zap,
  MessageSquare,
  TrendingUp,
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
  period?: "all-time";
}

export default function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [trending, setTrending] = useState<TrendingArticle[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const goPrevFeatured = () => {
    setFeaturedIndex((prev) =>
      prev === 0 ? featuredArticles.length - 1 : prev - 1,
    );
  };

  const goNextFeatured = () => {
    setFeaturedIndex((prev) =>
      prev === featuredArticles.length - 1 ? 0 : prev + 1,
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (featuredArticles.length <= 1) return;

    const interval = setInterval(() => {
      setFeaturedIndex((prev) =>
        prev === featuredArticles.length - 1 ? 0 : prev + 1,
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
    } catch (error) {
      console.error("Error loading homepage:", error);
    } finally {
      setLoading(false);
    }
  };

  const todayArticles = articles.slice(0, 6);

  return (
    <div className="bg-white" data-testid="homepage">
      {/* §1 Featured + Trending — Wave 1 */}
      <LazySectionShell sectionId="feed">
        <section className="py-12" aria-labelledby="home-feed-heading">
          <div className="px-4 mx-auto max-w-7xl">
            {loading ? (
              <div data-testid="homepage-loading">
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
            ) : (
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
                            <ArticleCard
                              article={article}
                              variant="featured"
                              priority={idx === 0}
                            />
                          </div>
                        ))}
                      </div>

                      {featuredArticles.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={goPrevFeatured}
                            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-jepang-border bg-white/90 text-jepang-navy shadow-sm backdrop-blur-sm transition-colors hover:bg-jepang-navy hover:text-white cursor-pointer"
                            aria-label="Artikel sebelumnya"
                          >
                            <ChevronLeft size={20} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={goNextFeatured}
                            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-jepang-border bg-white/90 text-jepang-navy shadow-sm backdrop-blur-sm transition-colors hover:bg-jepang-navy hover:text-white cursor-pointer"
                            aria-label="Artikel berikutnya"
                          >
                            <ChevronRight size={20} strokeWidth={1.5} />
                          </button>
                        </>
                      )}
                    </div>
                  ) : articles.length > 0 ? (
                    <ArticleCard
                      article={articles[0]}
                      variant="featured"
                      priority
                    />
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
                      <h3
                        id="home-feed-heading"
                        className="small-caps"
                      >
                        Sedang Tren Sekarang
                      </h3>
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
                      const thumbnailUrl =
                        article.coverImageUrl || article.cover_image_url;

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
            )}
          </div>
        </section>
      </LazySectionShell>

      {/* §2 Hero Ekosistem — static, no API */}
      <HomeHero />

      {/* §3 Artikel Hari Ini — Wave 1 */}
      <LazySectionShell sectionId="today">
        <section className="py-12 bg-jepang-off-white">
          <div className="px-4 mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-8 pb-3 border-b border-jepang-border">
              <div>
                <p className="small-caps text-jepang-red mb-1">今日 / HARI INI</p>
                <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter">
                  Artikel Hari Ini
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
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, idx) => (
                  <ArticleCardSkeleton key={idx} />
                ))}
              </div>
            ) : todayArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todayArticles.map((article: Article) => (
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
      </LazySectionShell>

      {/* §4 Kategori Editorial — Wave 2 (placeholder Fase 0) */}
      <LazySectionShell sectionId="categories-editorial">
        <HomePlaceholderSection sectionId="categories-editorial" />
      </LazySectionShell>

      {/* §5 Jepangku TV — Wave 3 (placeholder Fase 0) */}
      <LazySectionShell sectionId="tv">
        <HomePlaceholderSection sectionId="tv" />
      </LazySectionShell>

      {/* §6 Advertisement — Wave 3 (placeholder Fase 0) */}
      <LazySectionShell sectionId="ads">
        <HomePlaceholderSection sectionId="ads" />
      </LazySectionShell>

      {/* §7 Belajar Bahasa Jepang — Wave 3 (placeholder Fase 0) */}
      <LazySectionShell sectionId="lms">
        <HomePlaceholderSection sectionId="lms" />
      </LazySectionShell>

      {/* §8 Reaksi Komunitas — Wave 3 (placeholder Fase 0) */}
      <LazySectionShell sectionId="reactions">
        <HomePlaceholderSection sectionId="reactions" />
      </LazySectionShell>

      {/* §9–10 Polling, Kuis & Leaderboard — Wave 4 */}
      <LazySectionShell sectionId="engagement">
        {loading ? (
          <>
            <section className="py-12">
              <div className="px-4 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ArticleCardSkeleton />
                  <ArticleCardSkeleton />
                </div>
              </div>
            </section>
            <section className="py-12 bg-jepang-off-white">
              <div className="px-4 mx-auto max-w-7xl">
                <div className="bg-white border border-jepang-border">
                  {[...Array(5)].map((_, idx) => (
                    <LeaderboardRowSkeleton key={idx} />
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="py-12">
              <div className="px-4 mx-auto max-w-7xl">
                <div className="flex items-end justify-between mb-8 pb-3 border-b border-jepang-border">
                  <div>
                    <p className="section-label mb-1">
                      インタラクティブ / INTERAKTIF
                    </p>
                    <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter">
                      Polling & Kuis
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-lg border border-jepang-border bg-white p-6 shadow-jepang">
                    <div className="flex items-start gap-3 mb-4 pb-3 border-b border-jepang-border">
                      <MessageSquare
                        size={18}
                        strokeWidth={1.5}
                        className="mt-0.5 shrink-0 text-jepang-red"
                      />
                      <div className="min-w-0">
                        <p className="section-label mb-1">Polling</p>
                        {polls.length > 0 ? (
                          <h3 className="font-heading font-bold text-xl tracking-tight line-clamp-2">
                            {polls[0].title}
                          </h3>
                        ) : (
                          <h3 className="font-heading font-bold text-xl tracking-tight">
                            Poll Aktif
                          </h3>
                        )}
                      </div>
                    </div>
                    {polls.length > 0 ? (
                      <div>
                        <span className="jepang-badge mb-3">
                          {polls[0].pollType?.replace(/_/g, " ")}
                        </span>
                        <p className="text-sm text-jepang-muted mb-4">
                          {polls[0].questionCount || 0} pertanyaan ·{" "}
                          {polls[0].totalVotes || 0} suara
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

                  <div className="rounded-lg bg-jepang-navy p-6 text-white shadow-jepang">
                    <div className="flex items-start gap-3 mb-4 pb-3 border-b border-white/10">
                      <Zap
                        size={18}
                        strokeWidth={1.5}
                        className="mt-0.5 shrink-0 text-jepang-red"
                      />
                      <div className="min-w-0">
                        <p className="section-label mb-1">Kuis</p>
                        {quizzes.length > 0 ? (
                          <h3 className="font-heading font-bold text-xl tracking-tight line-clamp-2">
                            {quizzes[0].title}
                          </h3>
                        ) : (
                          <h3 className="font-heading font-bold text-xl tracking-tight">
                            Uji Pengetahuanmu
                          </h3>
                        )}
                      </div>
                    </div>
                    {quizzes.length > 0 ? (
                      <div>
                        <span className="jepang-badge-red mb-3">Kuis</span>
                        <p className="text-sm text-zinc-400 mb-4">
                          {quizzes[0].questionCount || 0} pertanyaan · +10 poin
                        </p>
                        <Link
                          href={`/quizzes/${quizzes[0].slug}`}
                          className="jepang-btn-primary inline-block"
                          data-testid="homepage-quiz-cta"
                        >
                          Mulai Kuis
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

            <section className="py-12 bg-jepang-off-white">
              <div className="px-4 mx-auto max-w-7xl">
                <div className="flex items-end justify-between mb-8 pb-3 border-b border-jepang-border">
                  <div>
                    <p className="small-caps text-jepang-red mb-1">
                      ランキング / PERINGKAT
                    </p>
                    <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter flex items-center gap-3">
                      <Trophy
                        size={32}
                        strokeWidth={1.5}
                        className="text-jepang-red"
                      />
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
                <div className="bg-white border border-jepang-border">
                  {leaderboard.length > 0 ? (
                    leaderboard
                      .slice(0, 5)
                      .map((entry: LeaderboardEntry, idx: number) => (
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
                              username={
                                entry.profileLinked ? entry.username : null
                              }
                              className="font-semibold block"
                            >
                              {entry.displayName}
                            </AuthorLink>
                            <AuthorLink
                              username={
                                entry.profileLinked ? entry.username : null
                              }
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
          </>
        )}
      </LazySectionShell>
    </div>
  );
}
