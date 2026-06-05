"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import {
  Bookmark,
  Share2,
  Eye,
  Calendar,
  ArrowLeft,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CommentSection from "@/components/CommentSection";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()!;
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [readCompleted, setReadCompleted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isLoading = loading && !article;

  useEffect(() => {
    loadArticle();
    setReadCompleted(false);
  }, [slug]);

  useEffect(() => {
    if (!user || readCompleted || !article) return;
    const handleScroll = () => {
      if (!contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      if (rect.bottom - window.innerHeight < 100) markReadComplete();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [user, article, readCompleted]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const data = await fetch(`/api/articles/${slug}`).then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      });
      setArticle(data);

      if (user) {
        // Fetch bookmark dan share status secara independen — error di sini
        // tidak boleh menyebabkan redirect ke /articles
        Promise.allSettled([
          fetch("/api/bookmarks", { credentials: "include" })
            .then((r) => r.json())
            .then((bookmarks) => {
              setIsBookmarked(
                Array.isArray(bookmarks) &&
                  bookmarks.some((b: any) => b.id === data.id),
              );
            }),
          fetch(`/api/articles/${slug}/share`, { credentials: "include" })
            .then((r) => (r.ok ? r.json() : { hasShared: false }))
            .then((shareStatus) => {
              setHasShared(shareStatus.hasShared || false);
            }),
        ]);
      }
    } catch {
      router.push("/articles");
    } finally {
      setLoading(false);
    }
  };

  const markReadComplete = async () => {
    if (readCompleted || !article || !user) return;
    setReadCompleted(true);
    try {
      const data = await fetch(`/api/articles/${slug}/read-complete`, {
        method: "POST",
        credentials: "include",
      }).then((r) => r.json());
      if (data.awarded) {
        toast.success(`+${data.points} poin untuk membaca!`);
        refreshUser();
      }
    } catch {}
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error("Silakan masuk untuk menyimpan artikel");
      router.push("/login");
      return;
    }
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
          refreshUser();
        } else toast.success("Artikel disimpan");
      }
    } catch {
      toast.error("Gagal menyimpan bookmark");
    }
  };

  const handleShare = async () => {
    // Allow guest users to copy link
    try {
      await navigator.clipboard.writeText(window.location.href);

      // If user is logged in, track share and award points
      if (user && !hasShared) {
        setIsSharing(true);
        try {
          const trackResponse = await fetch(`/api/articles/${slug}/share`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shareMethod: "copy-link" }),
          }).then((r) => r.json());

          if (trackResponse.pointsAwarded) {
            toast.success(`Tautan disalin! +${trackResponse.points} poin untuk berbagi!`);
            setHasShared(true);
            refreshUser();
          }
        } catch (error) {
          console.error("Error tracking share:", error);
        } finally {
          setIsSharing(false);
        }
      } else {
        toast.success("Tautan disalin!");
      }
    } catch {
      toast.error("Gagal menyalin tautan");
    }
  };

  if (!article && !loading) return null;

  return (
    <div className="bg-white" data-testid="article-detail-page">
      <article className="px-4 mx-auto max-w-7xl py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-6"
            data-testid="back-to-articles"
          >
            <ArrowLeft size={14} /> Kembali ke Artikel
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {isLoading ? (
              <>
                <div className="h-7 w-24 bg-jepang-red/10 animate-pulse" />
                <div className="h-7 w-16 bg-jepang-red/10 animate-pulse" />
              </>
            ) : (
              <>
                {article.category && (
                  <Link
                    href={`/articles?category=${article.category.slug}`}
                    data-testid="article-category-badge"
                  >
                    <Badge variant="red" className="hover:opacity-80">
                      {article.category.name}
                    </Badge>
                  </Link>
                )}
                {article.isHot && <Badge variant="black">HOT</Badge>}
              </>
            )}
          </div>

          <h1
            className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-6 leading-[1.05]"
            data-testid="article-title"
          >
            {isLoading ? (
              <div className="h-14 w-full max-w-3xl bg-jepang-red/10 animate-pulse" />
            ) : (
              article.title
            )}
          </h1>

          {isLoading ? (
            <div className="space-y-3 mb-6">
              <div className="h-5 bg-jepang-red/10 animate-pulse w-full" />
              <div className="h-5 bg-jepang-red/10 animate-pulse w-5/6" />
            </div>
          ) : (
            article.excerpt && (
              <p
                className="text-xl text-jepang-muted leading-relaxed mb-6 font-light"
                data-testid="article-excerpt"
              >
                {article.excerpt}
              </p>
            )
          )}

          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-jepang-border text-sm">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="w-8 h-8 bg-jepang-red/10 animate-pulse" />
              ) : (
                <div className="w-8 h-8 bg-foreground text-white flex items-center justify-center font-bold text-xs">
                  {article.author?.name?.charAt(0).toUpperCase() || "J"}
                </div>
              )}

              <div>
                {isLoading ? (
                  <>
                    <div className="h-4 w-28 bg-jepang-red/10 animate-pulse mb-2" />
                    <p className="text-[10px] uppercase tracking-wider font-mono text-jepang-muted">
                      PENULIS
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-sm">
                      {article.author?.name || "Jepangku"}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-mono text-jepang-muted">
                      PENULIS
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-jepang-muted font-mono text-xs uppercase tracking-wider">
              <Eye size={14} strokeWidth={1.5} />
              {isLoading ? (
                <>
                  <span className="h-3 w-8 bg-jepang-red/10 animate-pulse inline-block" />
                  <span>Dilihat</span>
                </>
              ) : (
                `${article.viewCount} dilihat`
              )}
            </div>

            <div className="flex items-center gap-1 text-jepang-muted font-mono text-xs uppercase tracking-wider">
              <Calendar size={14} strokeWidth={1.5} />
              {isLoading ? (
                <span className="h-3 w-20 bg-jepang-red/10 animate-pulse inline-block" />
              ) : (
                article.publishedAt &&
                new Date(article.publishedAt).toLocaleDateString()
              )}
            </div>

            <div className="flex gap-2 ml-auto">
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={handleBookmark}
                disabled={loading}
                data-testid="bookmark-btn"
              >
                <Bookmark
                  size={14}
                  strokeWidth={1.5}
                  fill={isBookmarked ? "currentColor" : "none"}
                />
                Simpan
              </Button>

              <Button
                variant={(user && hasShared) ? "default" : "outline"}
                size="sm"
                onClick={handleShare}
                disabled={loading || isSharing}
                data-testid="share-btn"
              >
                <Share2 size={14} strokeWidth={1.5} />
                {user && hasShared ? "Dibagikan" : "Bagikan"}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="my-8 -mx-4 md:mx-0">
              <div className="h-72 w-full bg-jepang-red/10 animate-pulse" />
            </div>
          ) : (
            article.coverImageUrl && (
              <div className="my-8 -mx-4 md:mx-0">
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className="w-full max-h-150 object-cover"
                />
              </div>
            )
          )}

          <div className="article-content" data-testid="article-content">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-5 bg-jepang-red/10 animate-pulse w-full" />
                <div className="h-5 bg-jepang-red/10 animate-pulse w-full" />
                <div className="h-5 bg-jepang-red/10 animate-pulse w-5/6" />
                <div className="h-5 bg-jepang-red/10 animate-pulse w-11/12" />
                <div className="h-5 bg-jepang-red/10 animate-pulse w-3/4" />
                <div className="h-5 bg-jepang-red/10 animate-pulse w-4/5" />
                <div className="h-5 bg-jepang-red/10 animate-pulse w-2/3" />
              </div>
            ) : (
              <div
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            )}
          </div>

          {readCompleted && user && (
            <div
              className="mt-8 p-4 bg-jepang-red text-white flex items-center gap-3"
              data-testid="read-complete-banner"
            >
              <Award size={20} strokeWidth={1.5} />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                +2 POIN DIBERIKAN UNTUK MEMBACA
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-jepang-border">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted mb-3">
              Tag
            </p>

            <div className="flex flex-wrap gap-2">
              {isLoading ? (
                <>
                  <div className="h-8 w-20 bg-jepang-red/10 animate-pulse" />
                  <div className="h-8 w-20 bg-jepang-red/10 animate-pulse" />
                  <div className="h-8 w-20 bg-jepang-red/10 animate-pulse" />
                </>
              ) : (
                article.tags?.map((tag: any) => (
                  <Badge key={tag.id} data-testid={`tag-${tag.slug}`}>
                    #{tag.name}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {article && (
            <CommentSection targetType="ARTICLE" targetId={article.id} />
          )}
        </div>
      </article>

      {(isLoading ||
        (article.relatedArticles && article.relatedArticles.length > 0)) && (
        <section className="py-12 bg-jepang-off-white">
          <div className="px-4 mx-auto max-w-7xl">
            <h2 className="font-heading font-black text-2xl md:text-3xl tracking-tighter mb-6 pb-3 border-b-2 border-foreground">
              Artikel Terkait
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading
                ? [1, 2, 3].map((key) => <ArticleCardSkeleton key={key} />)
                : article.relatedArticles.map((rel: any) => (
                    <ArticleCard key={rel.id} article={rel} />
                  ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
