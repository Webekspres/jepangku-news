"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { gamificationPatchFromResponse } from "@/lib/gamification-response";
import type { ArticleDetail } from "@/lib/articles/detail-types";
import { toast } from "sonner";

const BOOKMARK_DEBOUNCE_MS = 2_000;

export function useArticleDetail(slug: string) {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const [readCompleted, setReadCompleted] = useState(false);

  const isBookmarkedRef = useRef(false);
  const committedBookmarkRef = useRef(false);
  const articleIdRef = useRef<string | null>(null);
  const bookmarkDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookmarkSyncInFlightRef = useRef(false);

  const isLoading = loading && !article;

  useEffect(() => {
    isBookmarkedRef.current = isBookmarked;
  }, [isBookmarked]);

  useEffect(() => {
    articleIdRef.current = article?.id ?? null;
  }, [article?.id]);

  const loadArticle = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch(`/api/articles/${slug}`).then((r) => {
        if (!r.ok) throw new Error();
        return parseApiResponse<ArticleDetail>(r);
      });
      setArticle(data);

      if (user) {
        Promise.allSettled([
          fetch("/api/bookmarks", { credentials: "include" })
            .then((r) => parseApiResponse(r))
            .then((bookmarks) => {
              const bookmarked =
                Array.isArray(bookmarks) &&
                bookmarks.some((b: { id: string }) => b.id === data.id);
              setIsBookmarked(bookmarked);
              isBookmarkedRef.current = bookmarked;
              committedBookmarkRef.current = bookmarked;
            }),
          fetch(`/api/articles/${slug}/share`, { credentials: "include" })
            .then((r) =>
              r.ok
                ? parseApiResponse<{ hasShared?: boolean }>(r)
                : Promise.resolve({ hasShared: false }),
            )
            .then((shareStatus: { hasShared?: boolean }) => {
              setHasShared(shareStatus.hasShared || false);
            }),
        ]);
      }
    } catch {
      router.push("/articles");
    } finally {
      setLoading(false);
    }
  }, [router, slug, user]);

  const markReadComplete = useCallback(async () => {
    if (readCompleted || !article || !user) return;
    setReadCompleted(true);
    try {
      const data = await fetch(`/api/articles/${slug}/read-complete`, {
        method: "POST",
        credentials: "include",
      }).then((r) => parseApiResponse(r));
      if (data.awarded) {
        toast.success(`+${data.points} poin untuk membaca!`);
        await refreshUser(gamificationPatchFromResponse(data));
      }
    } catch {
      // diamkan: bonus baca tidak boleh mengganggu UX
    }
  }, [article, readCompleted, refreshUser, slug, user]);

  useEffect(() => {
    void loadArticle();
    setReadCompleted(false);
  }, [loadArticle]);

  useEffect(() => {
    if (!user || readCompleted || !article) return;
    const handleScroll = () => {
      if (!contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      if (rect.bottom - window.innerHeight < 100) {
        void markReadComplete();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [article, markReadComplete, readCompleted, user]);

  const flushBookmarkSync = useCallback(async () => {
    const articleId = articleIdRef.current;
    if (!articleId || !user) return;

    const desired = isBookmarkedRef.current;
    const committed = committedBookmarkRef.current;
    if (desired === committed) return;
    if (bookmarkSyncInFlightRef.current) return;

    bookmarkSyncInFlightRef.current = true;
    try {
      if (desired) {
        const res = await fetch(`/api/bookmarks/${articleId}`, {
          method: "POST",
          credentials: "include",
        });
        const data = await parseApiResponse(res);
        if (!res.ok) throw new Error(data.error || "Gagal menyimpan bookmark");
        committedBookmarkRef.current = true;
        if (data.pointsAwarded) {
          toast.success("+1 poin untuk bookmark!");
          await refreshUser(gamificationPatchFromResponse(data));
        } else {
          toast.success("Artikel disimpan");
        }
      } else {
        const res = await fetch(`/api/bookmarks/${articleId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          const data = await parseApiResponse(res).catch(() => ({}));
          throw new Error(data.error || "Gagal menghapus bookmark");
        }
        committedBookmarkRef.current = false;
        toast.success("Bookmark dihapus");
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Gagal menyimpan bookmark";
      toast.error(message);
      setIsBookmarked(committedBookmarkRef.current);
      isBookmarkedRef.current = committedBookmarkRef.current;
    } finally {
      bookmarkSyncInFlightRef.current = false;
      if (isBookmarkedRef.current !== committedBookmarkRef.current) {
        queueMicrotask(() => void flushBookmarkSync());
      }
    }
  }, [refreshUser, user]);

  const scheduleBookmarkSync = useCallback(() => {
    if (bookmarkDebounceRef.current) clearTimeout(bookmarkDebounceRef.current);
    bookmarkDebounceRef.current = setTimeout(() => {
      bookmarkDebounceRef.current = null;
      void flushBookmarkSync();
    }, BOOKMARK_DEBOUNCE_MS);
  }, [flushBookmarkSync]);

  useEffect(() => {
    return () => {
      if (bookmarkDebounceRef.current) {
        clearTimeout(bookmarkDebounceRef.current);
        bookmarkDebounceRef.current = null;
      }

      const articleId = articleIdRef.current;
      if (!articleId) return;

      const desired = isBookmarkedRef.current;
      const committed = committedBookmarkRef.current;
      if (desired === committed) return;

      void fetch(`/api/bookmarks/${articleId}`, {
        method: desired ? "POST" : "DELETE",
        credentials: "include",
        keepalive: true,
      });
    };
  }, []);

  const handleBookmark = useCallback(() => {
    if (!user) {
      toast.error("Silakan masuk untuk menyimpan artikel");
      router.push("/sign-in");
      return;
    }
    if (!article) return;

    const next = !isBookmarkedRef.current;
    setIsBookmarked(next);
    isBookmarkedRef.current = next;
    scheduleBookmarkSync();
  }, [article, router, scheduleBookmarkSync, user]);

  const handleShareComplete = useCallback(
    async (patch?: ReturnType<typeof gamificationPatchFromResponse>) => {
      setHasShared(true);
      if (patch) {
        await refreshUser(patch);
      }
    },
    [refreshUser],
  );

  return {
    article,
    loading,
    isLoading,
    isBookmarked,
    hasShared,
    readCompleted,
    contentRef,
    user,
    handleBookmark,
    handleShareComplete,
  };
}
