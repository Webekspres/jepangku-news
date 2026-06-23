"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import SidebarAdSlot from "@/components/home/SidebarAdSlot";
import TrendingArticlesPanel, {
  type TrendingArticleItem,
} from "@/components/home/TrendingArticlesPanel";
import RecommendedQuizzesPanel, {
  type RecommendedQuizItem,
} from "@/components/quizzes/RecommendedQuizzesPanel";
import { useAdSlot } from "@/hooks/useAdSlot";

type QuizDetailSidebarProps = {
  excludeQuizSlug?: string;
};

const RECOMMENDED_LIMIT = 4;
const TRENDING_LIMIT = 5;

export default function QuizDetailSidebar({ excludeQuizSlug }: QuizDetailSidebarProps) {
  const { data, isLoading, error } = useAdSlot("article-sidebar", {
    immediate: true,
  });

  const [quizzes, setQuizzes] = useState<RecommendedQuizItem[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [trending, setTrending] = useState<TrendingArticleItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadQuizzes() {
      setQuizzesLoading(true);
      try {
        const res = await fetch(
          `/api/quizzes?status=ACTIVE&limit=${RECOMMENDED_LIMIT + 1}`,
        );
        if (!res.ok) throw new Error("Failed to load quizzes");
        const json = (await parseApiResponse(res)) as { quizzes?: RecommendedQuizItem[] };
        const items = Array.isArray(json.quizzes) ? json.quizzes : [];
        const filtered = excludeQuizSlug
          ? items.filter((item) => item.slug !== excludeQuizSlug)
          : items;

        if (!cancelled) {
          setQuizzes(filtered.slice(0, RECOMMENDED_LIMIT));
        }
      } catch {
        if (!cancelled) setQuizzes([]);
      } finally {
        if (!cancelled) setQuizzesLoading(false);
      }
    }

    void loadQuizzes();

    return () => {
      cancelled = true;
    };
  }, [excludeQuizSlug]);

  useEffect(() => {
    let cancelled = false;

    async function loadTrending() {
      setTrendingLoading(true);
      try {
        const res = await fetch(
          `/api/articles?sort=trending&limit=${TRENDING_LIMIT}`,
        );
        if (!res.ok) throw new Error("Failed to load trending");
        const json = (await parseApiResponse(res)) as { articles?: TrendingArticleItem[] };
        const items = Array.isArray(json.articles) ? json.articles : [];

        if (!cancelled) {
          setTrending(items.slice(0, TRENDING_LIMIT));
        }
      } catch {
        if (!cancelled) setTrending([]);
      } finally {
        if (!cancelled) setTrendingLoading(false);
      }
    }

    void loadTrending();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6" data-testid="quiz-detail-sidebar">
      <RecommendedQuizzesPanel
        quizzes={quizzes}
        loading={quizzesLoading}
        testIdPrefix="quiz-sidebar-recommended"
      />

      <TrendingArticlesPanel
        articles={trending}
        loading={trendingLoading}
        testIdPrefix="quiz-sidebar-trending"
      />

      <SidebarAdSlot
        data={data}
        loading={isLoading}
        error={error}
        testId="quiz-sidebar-ad"
      />
    </div>
  );
}
