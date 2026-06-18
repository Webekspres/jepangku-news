"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { gamificationPatchFromResponse } from "@/lib/gamification-response";
import type { ArticleDetail } from "@/lib/articles/detail-types";
import { toast } from "sonner";

export function useArticleDetail(slug: string) {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const [readCompleted, setReadCompleted] = useState(false);

  const isLoading = loading && !article;

  const loadArticle = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch(`/api/articles/${slug}`).then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<ArticleDetail>;
      });
      setArticle(data);

      if (user) {
        Promise.allSettled([
          fetch("/api/bookmarks", { credentials: "include" })
            .then((r) => r.json())
            .then((bookmarks) => {
              setIsBookmarked(
                Array.isArray(bookmarks) &&
                  bookmarks.some((b: { id: string }) => b.id === data.id),
              );
            }),
          fetch(`/api/articles/${slug}/share`, { credentials: "include" })
            .then((r) => (r.ok ? r.json() : { hasShared: false }))
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
      }).then((r) => r.json());
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

  const handleBookmark = useCallback(async () => {
    if (!user) {
      toast.error("Silakan masuk untuk menyimpan artikel");
      router.push("/sign-in");
      return;
    }
    if (!article) return;

    try {
      if (isBookmarked) {
        await fetch(`/api/bookmarks/${article.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        setIsBookmarked(false);
        toast.success("Bookmark dihapus");
      } else {
        const data = await fetch(`/api/bookmarks/${article.id}`, {
          method: "POST",
          credentials: "include",
        }).then((r) => r.json());
        setIsBookmarked(true);
        if (data.pointsAwarded) {
          toast.success("+1 poin untuk bookmark!");
          await refreshUser(gamificationPatchFromResponse(data));
        } else {
          toast.success("Artikel disimpan");
        }
      }
    } catch {
      toast.error("Gagal menyimpan bookmark");
    }
  }, [article, isBookmarked, refreshUser, router, user]);

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
