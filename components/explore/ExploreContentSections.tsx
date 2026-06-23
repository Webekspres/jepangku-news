"use client";

import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import ExploreSidebar from "@/components/explore/ExploreSidebar";
import CardCoverImage from "@/components/CardCoverImage";
import { MotionHoverScale } from "@/components/ui/motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { resolveThumbnailUrl } from "@/lib/image-placeholder";
import { imageLoadingProps } from "@/lib/image-loading";
import type {
  ExplorePollPreview,
  ExploreQuizPreview,
  ExploreResponse,
} from "@/lib/explore/types";
import {
  ArrowRight,
  BarChart3,
  MessageSquare,
  Play,
  TrendingUp,
  Tv,
  Zap,
} from "lucide-react";

type ExploreContentSectionsProps = {
  data: ExploreResponse | null;
  loading: boolean;
};

function ExploreSectionHeader({
  label,
  title,
  href,
  icon,
  dark = false,
}: {
  label: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`mb-4 flex items-end justify-between gap-3 border-b-2 border-jepang-red pb-2 ${
        dark ? "" : ""
      }`}
    >
      <div className="flex min-w-0 items-start gap-2">
        <span className="mt-0.5 shrink-0 text-jepang-red">{icon}</span>
        <div>
          <p className={`section-label mb-0.5 text-[10px] ${dark ? "text-zinc-400" : ""}`}>
            {label}
          </p>
          <h2
            className={`font-heading text-xl font-black tracking-tighter md:text-2xl ${
              dark ? "text-white" : "section-title-gradient"
            }`}
          >
            {title}
          </h2>
        </div>
      </div>
      <Link
        href={href}
        className={`hidden shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors sm:inline-flex ${
          dark ? "text-zinc-400 hover:text-white" : "text-jepang-muted hover:text-jepang-red"
        }`}
      >
        Semua <ArrowRight size={11} />
      </Link>
    </div>
  );
}

function ExplorePollCard({ poll }: { poll: ExplorePollPreview }) {
  const thumbnailUrl = resolveThumbnailUrl(poll);

  return (
    <Link
      href={`/polls/${poll.slug}`}
      className="group relative block h-full"
      data-testid={`explore-poll-${poll.slug}`}
    >
      <Card className="h-full overflow-hidden border border-jepang-border bg-white transition-colors group-hover:border-jepang-navy">
        <div className="relative aspect-5/3 overflow-hidden bg-jepang-off-white">
          <MotionHoverScale className="absolute inset-0">
            <CardCoverImage
              src={thumbnailUrl}
              alt={poll.title}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 220px"
              quality={65}
            />
          </MotionHoverScale>
        </div>
        <CardContent className="p-2.5">
          <div className="mb-1.5 flex flex-wrap items-center gap-1">
            <Badge
              variant={poll.pollType === "VOTING" ? "red" : "black"}
              className="px-1.5 py-0 text-[9px]"
            >
              {poll.pollType === "VOTING" ? "VOTING" : "POLLING"}
            </Badge>
            <span className="flex items-center gap-0.5 text-[9px] font-mono uppercase tracking-wider text-jepang-muted">
              <BarChart3 size={9} strokeWidth={1.5} />
              {poll.totalVotes}
            </span>
          </div>
          <h3 className="line-clamp-2 font-heading text-sm font-bold leading-snug tracking-tight transition-colors group-hover:text-jepang-red">
            {poll.title}
          </h3>
          {poll.description ? (
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-jepang-muted">
              {poll.description}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}

function ExploreQuizCard({ quiz }: { quiz: ExploreQuizPreview }) {
  const thumbnailUrl = resolveThumbnailUrl(quiz);

  return (
    <Link
      href={`/quizzes/${quiz.slug}`}
      className="group relative block h-full"
      data-testid={`explore-quiz-${quiz.slug}`}
    >
      <Card className="h-full overflow-hidden border border-white/10 bg-white/5 transition-colors group-hover:border-jepang-orange/40">
        <div className="relative aspect-5/3 overflow-hidden bg-black/20">
          <MotionHoverScale className="absolute inset-0">
            <CardCoverImage
              src={thumbnailUrl}
              alt={quiz.title}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 220px"
              quality={65}
            />
          </MotionHoverScale>
        </div>
        <CardContent className="p-2.5">
          <Badge variant="red" className="mb-1.5 px-1.5 py-0 text-[9px]">
            Kuis
          </Badge>
          <h3 className="line-clamp-2 font-heading text-sm font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-jepang-orange">
            {quiz.title}
          </h3>
          {quiz.description ? (
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-400">
              {quiz.description}
            </p>
          ) : null}
          <p className="mt-1 text-[9px] text-zinc-400">
            {quiz.questionCount} Q · +10 poin
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ExploreVideoFeatured({
  video,
}: {
  video: NonNullable<ExploreResponse["featuredVideo"]>;
}) {
  return (
    <div className="min-w-0">
      <Link
        href={`/tv/${video.slug}`}
        className="group relative block aspect-video overflow-hidden bg-jepang-navy"
        data-testid={`explore-video-featured-${video.slug}`}
      >
        <MotionHoverScale className="absolute inset-0">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
            {...imageLoadingProps(true)}
          />
        </MotionHoverScale>
        <span className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-jepang-red text-white shadow-lg transition-transform group-hover:scale-110">
            <Play size={22} fill="currentColor" className="ml-0.5" />
          </span>
        </span>
      </Link>
      <div className="border-t border-jepang-border p-3">
        <Link href={`/tv/${video.slug}`} className="group block">
          <Badge variant="red" className="mb-1.5 px-1.5 py-0 text-[9px]">
            Unggulan
          </Badge>
          <h3 className="line-clamp-2 font-heading text-sm font-bold leading-snug transition-colors group-hover:text-jepang-red">
            {video.title}
          </h3>
          {video.description ? (
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-jepang-muted">
              {video.description}
            </p>
          ) : null}
        </Link>
      </div>
    </div>
  );
}

function ExploreVideoSidebarItem({
  video,
}: {
  video: NonNullable<ExploreResponse["featuredVideo"]>;
}) {
  return (
    <Link
      href={`/tv/${video.slug}`}
      className="group flex w-full gap-2.5 border-b border-white/10 p-2.5 text-left transition-colors last:border-b-0 hover:bg-white/5"
      data-testid={`explore-video-${video.slug}`}
    >
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-sm bg-black/30">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          sizes="80px"
          className="object-cover"
          {...imageLoadingProps(false)}
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play size={12} fill="white" className="text-white" />
        </span>
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="line-clamp-2 text-xs font-semibold leading-snug text-white group-hover:text-jepang-orange">
          {video.title}
        </p>
        {video.viewCount > 0 ? (
          <p className="mt-0.5 text-[9px] font-mono uppercase tracking-wider text-zinc-400">
            {video.viewCount.toLocaleString("id-ID")} views
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function ExploreVideoGridCard({
  video,
}: {
  video: NonNullable<ExploreResponse["featuredVideo"]>;
}) {
  return (
    <Link
      href={`/tv/${video.slug}`}
      className="group relative block h-full"
      data-testid={`explore-video-${video.slug}`}
    >
      <Card className="h-full overflow-hidden border border-jepang-border bg-white transition-colors group-hover:border-jepang-navy">
        <div className="relative aspect-5/3 overflow-hidden bg-jepang-off-white">
          <MotionHoverScale className="absolute inset-0">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              sizes="220px"
              className="object-cover"
              {...imageLoadingProps(false)}
            />
          </MotionHoverScale>
          <span className="absolute inset-0 flex items-center justify-center bg-black/25">
            <Play size={16} fill="white" className="text-white" />
          </span>
        </div>
        <CardContent className="p-2.5">
          <h3 className="line-clamp-2 font-heading text-sm font-bold leading-snug transition-colors group-hover:text-jepang-red">
            {video.title}
          </h3>
          {video.viewCount > 0 ? (
            <p className="mt-1 text-[9px] font-mono uppercase tracking-wider text-jepang-muted">
              {video.viewCount.toLocaleString("id-ID")} views
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}

function ExploreVideosSection({ data }: { data: ExploreResponse }) {
  const { featuredVideo, videos } = data;

  if (featuredVideo) {
    return (
      <div className="overflow-hidden rounded-lg border border-jepang-border bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px]">
          <ExploreVideoFeatured video={featuredVideo} />
          {videos.length > 0 ? (
            <aside className="bg-jepang-navy lg:border-l border-jepang-border">
              <div className="border-b border-white/10 px-3 py-2">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Lainnya
                </p>
              </div>
              <div>
                {videos.map((video) => (
                  <ExploreVideoSidebarItem key={video.id} video={video} />
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <ExploreVideoGridCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function ExploreSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8">
      <div className="space-y-10" data-testid="explore-loading">
        <div className="space-y-4">
          <div className="h-6 w-40 animate-pulse rounded bg-jepang-border/60" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ArticleCardSkeleton key={i} variant="grid" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <ArticleCardSkeleton key={i} variant="grid" />
          ))}
        </div>
      </div>
      <div className="hidden space-y-4 lg:block">
        <div className="h-48 animate-pulse rounded-lg bg-jepang-border/60" />
        <div className="h-32 animate-pulse rounded-lg bg-jepang-border/60" />
      </div>
    </div>
  );
}

export default function ExploreContentSections({
  data,
  loading,
}: ExploreContentSectionsProps) {
  if (loading || !data) {
    return <ExploreSkeleton />;
  }

  const hasVideos = Boolean(data.featuredVideo || data.videos.length > 0);
  const gridClass = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
      <main className="min-w-0 space-y-10">
        <section data-testid="explore-articles-section">
          <ExploreSectionHeader
            label="記事 / ARTIKEL"
            title="Artikel Sedang Tren"
            href="/trending"
            icon={<TrendingUp size={18} strokeWidth={1.5} />}
          />
          {data.trendingArticles.length > 0 ? (
            <div className={gridClass}>
              {data.trendingArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant="grid"
                  priority={index < 2}
                />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-jepang-muted">
              Belum ada artikel tren saat ini.
            </p>
          )}
        </section>

        <section data-testid="explore-polls-section">
          <ExploreSectionHeader
            label="投票 / POLLING"
            title="Polling Aktif"
            href="/polls"
            icon={<MessageSquare size={18} strokeWidth={1.5} />}
          />
          {data.polls.length > 0 ? (
            <div className={gridClass}>
              {data.polls.map((poll) => (
                <ExplorePollCard key={poll.id} poll={poll} />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-jepang-border bg-jepang-off-white py-8 text-center text-sm text-jepang-muted">
              Tidak ada polling aktif saat ini.
            </p>
          )}
        </section>

        <section
          className="rounded-lg bg-jepang-navy p-4 text-white shadow-jepang md:p-5"
          data-testid="explore-quizzes-section"
        >
          <ExploreSectionHeader
            label="クイズ / KUIS"
            title="Uji Pengetahuanmu"
            href="/quizzes"
            icon={<Zap size={18} strokeWidth={1.5} />}
            dark
          />
          {data.quizzes.length > 0 ? (
            <div className={gridClass}>
              {data.quizzes.map((quiz) => (
                <ExploreQuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-zinc-400">
              Belum ada kuis yang tersedia.
            </p>
          )}
        </section>

        {hasVideos ? (
          <section data-testid="explore-videos-section">
            <ExploreSectionHeader
              label="テレビ / JEPANGKU TV"
              title="Video Terbaru"
              href="/tv"
              icon={<Tv size={18} strokeWidth={1.5} />}
            />
            <ExploreVideosSection data={data} />
          </section>
        ) : null}

        <div className="lg:hidden">
          <ExploreSidebar data={data} />
        </div>
      </main>

      <aside className="hidden h-full lg:block">
        <div className="sticky top-24">
          <ExploreSidebar data={data} />
        </div>
      </aside>
    </div>
  );
}
