"use client";
export const dynamic = "force-dynamic";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import { useParams } from "next/navigation";
import Link from "next/link";
import CardCoverImage from "@/components/CardCoverImage";
import { MotionHoverScale } from "@/components/ui/motion";
import {
  Award,
  BarChart3,
  ChevronRight,
  MessageSquare,
  Smile,
  Zap,
} from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import SectionHeader from "@/components/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InteractiveBentoGrid,
  interactiveBentoSpan,
  resolveThumbnailUrl,
} from "@/components/interactive/InteractiveBentoGrid";
import InteractiveBentoSkeleton, {
  InteractiveBentoLoadMoreSkeleton,
} from "@/components/skeletons/InteractiveBentoSkeleton";
import type {
  ReactionBrowseArticleItem,
  ReactionBrowsePollItem,
  ReactionBrowseQuizItem,
  ReactionBrowseResponse,
} from "@/lib/reactions/browse";
import { CONTENT_REACTIONS, getReactionDisplay } from "@/lib/reactions-display";
import { cn } from "@/lib/utils";

const PER_PAGE = 12;

type BrowseState<T> = {
  items: T[];
  total: number;
  page: number;
  loading: boolean;
  loadingMore: boolean;
};

function emptyBrowseState<T>(): BrowseState<T> {
  return { items: [], total: 0, page: 1, loading: true, loadingMore: false };
}

function QuizBrowseCard({ quiz }: { quiz: ReactionBrowseQuizItem }) {
  const thumbnailUrl = resolveThumbnailUrl(quiz);

  const footer = (
    <div className="mt-auto flex items-center justify-between border-t border-jepang-border pt-3 text-xs font-mono uppercase tracking-wider">
      <span className="text-jepang-muted">
        {quiz.questionCount} Q · {quiz.reactionCount} reaksi
      </span>
      <span className="flex items-center gap-1 font-bold text-jepang-red">
        <Award size={12} strokeWidth={1.5} /> +{quiz.pointsReward || 10} POIN
      </span>
    </div>
  );

  return (
    <Link
      href={`/quizzes/${quiz.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-jepang-border bg-white transition-all hover:border-jepang-navy/30 hover:shadow-sm",
        interactiveBentoSpan(true),
      )}
      data-testid={`reaction-quiz-card-${quiz.slug}`}
    >
      <div className="relative aspect-16/10 shrink-0 overflow-hidden bg-jepang-off-white">
        <MotionHoverScale className="absolute inset-0">
          <CardCoverImage
            src={thumbnailUrl}
            alt={quiz.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </MotionHoverScale>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <Badge variant="red" className="w-fit">
          QUIZ
        </Badge>
        <h3 className="line-clamp-2 font-heading text-xl font-bold transition-colors group-hover:text-jepang-red">
          {quiz.title}
        </h3>
        {quiz.description ? (
          <p className="line-clamp-2 text-sm text-jepang-muted">{quiz.description}</p>
        ) : null}
        {footer}
      </div>
    </Link>
  );
}

function PollBrowseCard({ poll }: { poll: ReactionBrowsePollItem }) {
  const thumbnailUrl = resolveThumbnailUrl(poll);

  const footer = (
    <div className="mt-auto flex items-center justify-between border-t border-jepang-border pt-3 text-xs font-mono uppercase tracking-wider">
      <span className="flex items-center gap-1 text-jepang-muted">
        <BarChart3 size={11} strokeWidth={1.5} /> {poll.totalVotes} VOTES · {poll.reactionCount} reaksi
      </span>
      <span className="flex items-center gap-0.5 font-bold text-jepang-red transition-all group-hover:gap-1.5">
        Ikuti <ChevronRight size={12} strokeWidth={2.5} />
      </span>
    </div>
  );

  const metaRow = (
    <div className="flex items-center justify-between gap-2">
      <Badge variant={poll.pollType === "VOTING" ? "red" : "black"}>
        {poll.pollType === "VOTING" ? "VOTING" : "POLLING"}
      </Badge>
      <span className="flex shrink-0 items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-jepang-red">
        <Award size={11} strokeWidth={1.5} /> +{poll.pointsReward || 5} POIN
      </span>
    </div>
  );

  return (
    <Link
      href={`/polls/${poll.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-jepang-border bg-white transition-colors hover:border-jepang-navy/30 hover:shadow-sm",
        interactiveBentoSpan(true),
      )}
      data-testid={`reaction-poll-card-${poll.slug}`}
    >
      <div className="relative aspect-16/10 shrink-0 overflow-hidden bg-jepang-off-white">
        <MotionHoverScale className="absolute inset-0">
          <CardCoverImage
            src={thumbnailUrl}
            alt={poll.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </MotionHoverScale>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {metaRow}
        <h3 className="font-heading text-lg font-bold leading-tight tracking-tight group-hover:text-jepang-red transition-colors">
          {poll.title}
        </h3>
        {poll.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-jepang-muted">
            {poll.description}
          </p>
        ) : null}
        {footer}
      </div>
    </Link>
  );
}

function BrowseLoadMoreButton({
  hasMore,
  loadingMore,
  onClick,
  testId,
}: {
  hasMore: boolean;
  loadingMore: boolean;
  onClick: () => void;
  testId: string;
}) {
  if (!hasMore) return null;

  return (
    <div className="mt-10 flex justify-center">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onClick}
        disabled={loadingMore}
        data-testid={testId}
      >
        {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
      </Button>
    </div>
  );
}

export default function ReactionBrowsePage() {
  const params = useParams<{ type: string }>();
  const reactionSlug = (params.type ?? "").toLowerCase();

  const reactionMeta = useMemo(
    () => CONTENT_REACTIONS.find((item) => item.key.toLowerCase() === reactionSlug) ?? null,
    [reactionSlug],
  );

  const [articles, setArticles] = useState<BrowseState<ReactionBrowseArticleItem>>(
    emptyBrowseState(),
  );
  const [quizzes, setQuizzes] = useState<BrowseState<ReactionBrowseQuizItem>>(
    emptyBrowseState(),
  );
  const [polls, setPolls] = useState<BrowseState<ReactionBrowsePollItem>>(emptyBrowseState());

  const fetchBrowse = useCallback(
    async <T extends ReactionBrowseResponse["items"][number]>(
      targetType: "ARTICLE" | "QUIZ" | "POLL",
      pageNum: number,
      _reset: boolean,
    ): Promise<{ items: T[]; total: number; page: number }> => {
      const search = new URLSearchParams({
        type: reactionSlug.toUpperCase(),
        targetType,
        limit: String(PER_PAGE),
        page: String(pageNum),
      });
      const response = await fetch(`/api/reactions/browse?${search}`);
      if (!response.ok) throw new Error("browse failed");
      const data = (await parseApiResponse(response)) as ReactionBrowseResponse;
      return {
        items: data.items as T[],
        total: data.total,
        page: data.page,
      };
    },
    [reactionSlug],
  );

  const loadSection = useCallback(
    async <T extends ReactionBrowseResponse["items"][number]>(
      targetType: "ARTICLE" | "QUIZ" | "POLL",
      pageNum: number,
      reset: boolean,
      setter: Dispatch<SetStateAction<BrowseState<T>>>,
    ) => {
      setter((prev) => ({
        ...prev,
        loading: reset,
        loadingMore: !reset,
      }));

      try {
        const data = await fetchBrowse<T>(targetType, pageNum, reset);
        setter((prev) => ({
          items: reset
            ? data.items
            : (() => {
                const ids = new Set(prev.items.map((item) => item.id));
                return [
                  ...prev.items,
                  ...data.items.filter((item) => !ids.has(item.id)),
                ];
              })(),
          total: data.total,
          page: data.page,
          loading: false,
          loadingMore: false,
        }));
      } catch {
        setter((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
        }));
      }
    },
    [fetchBrowse],
  );

  useEffect(() => {
    if (!reactionMeta) return;
    setArticles(emptyBrowseState());
    setQuizzes(emptyBrowseState());
    setPolls(emptyBrowseState());
    void loadSection("ARTICLE", 1, true, setArticles);
    void loadSection("QUIZ", 1, true, setQuizzes);
    void loadSection("POLL", 1, true, setPolls);
  }, [reactionMeta, loadSection]);

  if (!reactionMeta) {
    return (
      <div className="min-h-screen bg-white py-24 text-center">
        <p className="mb-2 font-heading text-2xl font-bold">Reaksi tidak ditemukan</p>
        <Link href="/" className="text-jepang-red hover:underline">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  const display = getReactionDisplay(reactionMeta.key);

  return (
    <div className="min-h-screen bg-white" data-testid="reaction-browse-page">
      <SectionHeader
        label="リアクション / REAKSI"
        title={
          <span className="inline-flex items-center gap-3">
            <span className="text-4xl leading-none">{display.emoji}</span>
            Konten dengan reaksi {display.label}
          </span>
        }
        subtitle="Jelajahi artikel, kuis, dan polling yang mendapat reaksi ini dari komunitas Jepangku."
      />

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-12">
        <section data-testid="reaction-browse-articles">
          <div className="mb-6 flex items-end justify-between border-b border-jepang-border pb-3">
            <div>
              <p className="section-label mb-1">記事 / ARTIKEL</p>
              <h2 className="font-heading text-2xl font-black tracking-tighter">Artikel</h2>
            </div>
            <Link
              href="/articles"
              className="text-sm font-semibold uppercase tracking-wider hover:text-jepang-red"
            >
              Semua Artikel
            </Link>
          </div>

          {articles.loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <ArticleCardSkeleton key={index} />
              ))}
            </div>
          ) : articles.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.items.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    reactionBadge={{
                      iconSrc: display.iconSrc,
                      label: `${article.reactionCount} ${display.label}`,
                    }}
                  />
                ))}
              </div>
              <BrowseLoadMoreButton
                hasMore={articles.items.length < articles.total}
                loadingMore={articles.loadingMore}
                onClick={() => loadSection("ARTICLE", articles.page + 1, false, setArticles)}
                testId="reaction-articles-load-more"
              />
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-jepang-border py-16 text-center">
              <Smile size={40} strokeWidth={1.5} className="mx-auto mb-3 text-jepang-muted" />
              <p className="font-heading text-xl font-bold">Belum ada artikel</p>
              <p className="mt-2 text-sm text-jepang-muted">
                Belum ada artikel dengan reaksi {display.label}.
              </p>
            </div>
          )}
        </section>

        <section data-testid="reaction-browse-quizzes">
          <div className="mb-6 flex items-end justify-between border-b border-jepang-border pb-3">
            <div>
              <p className="section-label mb-1">クイズ / KUIS</p>
              <h2 className="font-heading text-2xl font-black tracking-tighter">Kuis</h2>
            </div>
            <Link
              href="/quizzes"
              className="text-sm font-semibold uppercase tracking-wider hover:text-jepang-red"
            >
              Semua Kuis
            </Link>
          </div>

          {quizzes.loading ? (
            <InteractiveBentoSkeleton count={PER_PAGE} />
          ) : quizzes.items.length > 0 ? (
            <>
              <InteractiveBentoGrid>
                {quizzes.items.map((quiz) => (
                  <QuizBrowseCard key={quiz.id} quiz={quiz} />
                ))}
                {quizzes.loadingMore ? <InteractiveBentoLoadMoreSkeleton count={3} /> : null}
              </InteractiveBentoGrid>
              <BrowseLoadMoreButton
                hasMore={quizzes.items.length < quizzes.total}
                loadingMore={quizzes.loadingMore}
                onClick={() => loadSection("QUIZ", quizzes.page + 1, false, setQuizzes)}
                testId="reaction-quizzes-load-more"
              />
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-jepang-border py-16 text-center">
              <Zap size={40} strokeWidth={1.5} className="mx-auto mb-3 text-jepang-muted" />
              <p className="font-heading text-xl font-bold">Belum ada kuis</p>
              <p className="mt-2 text-sm text-jepang-muted">
                Belum ada kuis dengan reaksi {display.label}.
              </p>
            </div>
          )}
        </section>

        <section data-testid="reaction-browse-polls">
          <div className="mb-6 flex items-end justify-between border-b border-jepang-border pb-3">
            <div>
              <p className="section-label mb-1">投票 / POLLING</p>
              <h2 className="font-heading text-2xl font-black tracking-tighter">Polling</h2>
            </div>
            <Link
              href="/polls"
              className="text-sm font-semibold uppercase tracking-wider hover:text-jepang-red"
            >
              Semua Polling
            </Link>
          </div>

          {polls.loading ? (
            <InteractiveBentoSkeleton count={9} />
          ) : polls.items.length > 0 ? (
            <>
              <InteractiveBentoGrid>
                {polls.items.map((poll) => (
                  <PollBrowseCard key={poll.id} poll={poll} />
                ))}
                {polls.loadingMore ? <InteractiveBentoLoadMoreSkeleton count={3} /> : null}
              </InteractiveBentoGrid>
              <BrowseLoadMoreButton
                hasMore={polls.items.length < polls.total}
                loadingMore={polls.loadingMore}
                onClick={() => loadSection("POLL", polls.page + 1, false, setPolls)}
                testId="reaction-polls-load-more"
              />
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-jepang-border py-16 text-center">
              <MessageSquare size={40} strokeWidth={1.5} className="mx-auto mb-3 text-jepang-muted" />
              <p className="font-heading text-xl font-bold">Belum ada polling</p>
              <p className="mt-2 text-sm text-jepang-muted">
                Belum ada polling dengan reaksi {display.label}.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
