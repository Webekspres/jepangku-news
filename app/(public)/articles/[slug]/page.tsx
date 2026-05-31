"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ArticleCard from "@/components/ArticleCard";
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

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()!;
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readCompleted, setReadCompleted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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
        const bookmarks = await fetch("/api/bookmarks").then((r) => r.json());
        setIsBookmarked(
          Array.isArray(bookmarks) &&
            bookmarks.some((b: any) => b.id === data.id),
        );
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
      }).then((r) => r.json());
      if (data.awarded) {
        toast.success(`+${data.points} points for reading!`);
        refreshUser();
      }
    } catch {}
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error("Please login to bookmark");
      router.push("/login");
      return;
    }
    try {
      if (isBookmarked) {
        await fetch(`/api/bookmarks/${article.id}`, { method: "DELETE" });
        setIsBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        const data = await fetch(`/api/bookmarks/${article.id}`, {
          method: "POST",
        }).then((r) => r.json());
        setIsBookmarked(true);
        if (data.pointsAwarded) {
          toast.success("+1 point for bookmarking!");
          refreshUser();
        } else toast.success("Bookmarked");
      }
    } catch {
      toast.error("Failed to bookmark");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (loading)
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        data-testid="article-detail-loading"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted">
          Loading article...
        </p>
      </div>
    );
  if (!article) return null;

  return (
    <div className="bg-white" data-testid="article-detail-page">
      <article className="px-4 mx-auto max-w-7xl py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-6"
            data-testid="back-to-articles"
          >
            <ArrowLeft size={14} /> Back to Articles
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
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
          </div>

          <h1
            className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-6 leading-[1.05]"
            data-testid="article-title"
          >
            {article.title}
          </h1>

          {article.excerpt && (
            <p
              className="text-xl text-jepang-muted leading-relaxed mb-6 font-light"
              data-testid="article-excerpt"
            >
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-jepang-border text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground text-white flex items-center justify-center font-bold text-xs">
                {article.author?.name?.charAt(0).toUpperCase() || "J"}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {article.author?.name || "Jepangku"}
                </p>
                <p className="text-[10px] uppercase tracking-wider font-mono text-jepang-muted">
                  AUTHOR
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-jepang-muted font-mono text-xs uppercase tracking-wider">
              <Eye size={14} strokeWidth={1.5} /> {article.viewCount} VIEWS
            </div>
            {article.publishedAt && (
              <div className="flex items-center gap-1 text-jepang-muted font-mono text-xs uppercase tracking-wider">
                <Calendar size={14} strokeWidth={1.5} />{" "}
                {new Date(article.publishedAt).toLocaleDateString()}
              </div>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={handleBookmark}
                data-testid="bookmark-btn"
              >
                <Bookmark
                  size={14}
                  strokeWidth={1.5}
                  fill={isBookmarked ? "currentColor" : "none"}
                />
                {isBookmarked ? "Saved" : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                data-testid="share-btn"
              >
                <Share2 size={14} strokeWidth={1.5} /> Share
              </Button>
            </div>
          </div>

          {article.coverImageUrl && (
            <div className="my-8 -mx-4 md:mx-0">
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="w-full max-h-[600px] object-cover"
              />
            </div>
          )}

          <div
            ref={contentRef}
            className="article-content"
            data-testid="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {readCompleted && user && (
            <div
              className="mt-8 p-4 bg-jepang-red text-white flex items-center gap-3"
              data-testid="read-complete-banner"
            >
              <Award size={20} strokeWidth={1.5} />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                +2 POINTS AWARDED FOR READING
              </p>
            </div>
          )}

          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-jepang-border">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted mb-3">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: any) => (
                  <Badge key={tag.id} data-testid={`tag-${tag.slug}`}>
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <section className="py-12 bg-jepang-off-white">
          <div className="px-4 mx-auto max-w-7xl">
            <h2 className="font-heading font-black text-2xl md:text-3xl tracking-tighter mb-6 pb-3 border-b-2 border-foreground">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {article.relatedArticles.map((rel: any) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
