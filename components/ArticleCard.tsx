"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AuthorLink from "@/components/AuthorLink";
import CardCoverImage from "@/components/CardCoverImage";
import ReactionIcon from "@/components/reactions/ReactionIcon";
import { MotionHoverScale } from "@/components/ui/motion";
import { formatArticleDate } from "@/lib/home/format-article-date";
import {
  resolveCardImageUrl,
  resolveThumbnailUrl,
} from "@/lib/image-placeholder";
import { cn } from "@/lib/utils";
import { Clock, Eye, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  cover_image_url?: string | null;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  publishedAt?: Date | string | null;
  viewCount?: number;
  view_count?: number;
  isHot?: boolean;
  is_hot?: boolean;
  isFeatured?: boolean;
  is_featured?: boolean;
  author?: { name: string; username: string } | null;
  category?: { name: string; slug: string } | null;
}

interface ArticleCardProps {
  article: Article;
  /** featured = hero beranda; editorial = kolom kategori (compact + radius) */
  variant?: "default" | "featured" | "editorial" | "compact" | "grid";
  /**
   * @deprecated Gunakan variant="editorial".
   * Dipertahankan: variant="featured" + featuredSize="editorial"
   */
  featuredSize?: "hero" | "editorial";
  priority?: boolean;
  /** Label reaksi dominan (homepage reaksi komunitas) */
  reactionBadge?: { iconSrc: string; label: string };
  className?: string;
  /** Override data-testid pada link featured */
  testId?: string;
}

export default function ArticleCard({
  article,
  variant = "default",
  featuredSize = "hero",
  priority = false,
  reactionBadge,
  className,
  testId,
}: ArticleCardProps) {
  const coverUrl = resolveCardImageUrl(
    article.coverImageUrl || article.cover_image_url,
  );
  const viewCount = article.viewCount ?? article.view_count ?? 0;
  const isHot = article.isHot ?? article.is_hot ?? false;
  const isEditorial =
    variant === "editorial" ||
    (variant === "featured" && featuredSize === "editorial");

  if (isEditorial) {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className={cn(
          "group relative block aspect-video w-full overflow-hidden rounded-xl",
          className,
        )}
        data-testid={testId ?? `article-featured-${article.slug}`}
      >
        <MotionHoverScale className="absolute inset-0">
          <CardCoverImage
            src={resolveThumbnailUrl(article)}
            alt={article.title}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
          />
        </MotionHoverScale>
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3.5 md:p-4 text-white">
          {article.category ? (
            <span className="inline-block mb-1.5 rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {article.category.name}
            </span>
          ) : null}
          <h4 className="font-heading font-black text-base md:text-xl tracking-tight line-clamp-2 group-hover:text-jepang-yellow transition-colors">
            {article.title}
          </h4>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-zinc-300 font-mono uppercase tracking-wider">
            {article.author ? (
              <span className="inline-flex items-center gap-1">
                <User size={11} strokeWidth={1.5} />
                {article.author.name}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Clock size={11} strokeWidth={1.5} />
              {formatArticleDate(article.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <div
        className={cn(
          "group block relative h-115 md:h-140 overflow-hidden",
          className,
        )}
      >
        <div className="absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-90">
          <CardCoverImage
            src={coverUrl}
            alt={article.title}
            sizes="(max-width: 1024px) 100vw, calc(100vw - 360px)"
            priority={priority}
            quality={priority ? 80 : 75}
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
        <div className="absolute top-6 left-6 flex gap-2">
          <Badge variant="red">UNGGULAN</Badge>
          {article.category && (
            <Badge className="bg-white text-foreground border-white">
              {article.category.name}
            </Badge>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter mb-3 group-hover:text-jepang-yellow transition-colors">
            <Link
              href={`/articles/${article.slug}`}
              className="after:absolute after:inset-0 after:z-10"
              data-testid={testId ?? `article-featured-${article.slug}`}
            >
              {article.title}
            </Link>
          </h2>
          {article.excerpt && (
            <p className="text-zinc-300 text-base md:text-lg max-w-2xl line-clamp-2">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 mt-4 text-xs text-zinc-400 font-mono uppercase tracking-wider">
            {article.author && (
              <span className="relative z-20">
                OLEH{" "}
                <AuthorLink username={article.author.username} className="hover:text-white">
                  {article.author.name}
                </AuthorLink>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye size={14} strokeWidth={1.5} /> {viewCount}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className="group block"
        data-testid={`article-compact-${article.slug}`}
      >
        <Card className="group flex gap-3 py-4 border-b border-jepang-border last:border-b-0">
          <div className="relative w-20 h-20 shrink-0 bg-jepang-off-white overflow-hidden">
            <CardCoverImage
              src={coverUrl}
              alt={article.title}
              sizes="80px"
              priority={priority}
            />
          </div>
          <div className="flex-1 min-w-0">
            {article.category && (
              <span className="text-[10px] uppercase tracking-wider font-bold text-jepang-red">
                {article.category.name}
              </span>
            )}
            <h3 className="font-heading font-bold text-sm md:text-base line-clamp-2 group-hover:text-jepang-red transition-colors">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-jepang-muted font-mono">
              <Eye size={10} /> {viewCount}
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === "grid") {
    return (
      <div className="group relative block h-full">
        <motion.div className="h-full" whileHover={{ borderColor: "var(--color-jepang-navy)" }} transition={{ duration: 0.2 }}>
          <Card className="group flex h-full flex-col overflow-hidden border border-jepang-border bg-white">
            <div className="relative aspect-5/3 overflow-hidden bg-jepang-off-white">
              <MotionHoverScale className="relative h-full w-full">
                <CardCoverImage
                  src={coverUrl}
                  alt={article.title}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 220px"
                  priority={priority}
                  quality={65}
                />
              </MotionHoverScale>
            </div>
            <CardContent className="flex flex-1 flex-col p-2.5">
              <div className="mb-1.5 flex flex-wrap items-center gap-1">
                {article.category ? (
                  <Badge className="px-1.5 py-0 text-[9px]">{article.category.name}</Badge>
                ) : null}
                {isHot ? (
                  <Badge variant="red" className="px-1.5 py-0 text-[9px]">
                    HOT
                  </Badge>
                ) : null}
              </div>
              <h3 className="line-clamp-2 font-heading text-sm font-bold leading-snug tracking-tight transition-colors group-hover:text-jepang-red">
                <Link
                  href={`/articles/${article.slug}`}
                  className="after:absolute after:inset-0 after:z-10"
                  data-testid={`article-card-${article.slug}`}
                >
                  {article.title}
                </Link>
              </h3>
              {article.excerpt ? (
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-jepang-muted">
                  {article.excerpt}
                </p>
              ) : null}
              <div className="relative z-20 mt-auto flex items-center justify-between border-t border-jepang-border pt-1.5 text-[9px] font-mono uppercase tracking-wider text-jepang-muted">
                <AuthorLink
                  username={article.author?.username}
                  className="max-w-[58%] truncate hover:text-jepang-red"
                >
                  {article.author?.name || "Jepangku"}
                </AuthorLink>
                <span className="flex shrink-0 items-center gap-0.5">
                  <Eye size={10} strokeWidth={1.5} /> {viewCount}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="group block relative h-full">
      <motion.div className="h-full" whileHover={{ borderColor: "var(--color-jepang-navy)" }} transition={{ duration: 0.2 }}>
      <Card className="group flex h-full flex-col overflow-hidden bg-white border border-jepang-border relative">
        <div className="relative aspect-16/10 overflow-hidden bg-jepang-off-white">
          <MotionHoverScale className="relative h-full w-full">
            <CardCoverImage
              src={coverUrl}
              alt={article.title}
              sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              quality={75}
            />
          </MotionHoverScale>
          {reactionBadge ? (
            <Badge
              variant="yellow"
              className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 uppercase shadow-md"
            >
              <ReactionIcon src={reactionBadge.iconSrc} size={26} />
            </Badge>
          ) : null}
        </div>
        <CardContent className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2 mb-3">
            {article.category && <Badge>{article.category.name}</Badge>}
            {isHot && <Badge variant="red">HOT</Badge>}
          </div>
          <h3 className="font-heading font-bold text-xl tracking-tight mb-2 group-hover:text-jepang-red transition-colors line-clamp-2">
            <Link
              href={`/articles/${article.slug}`}
              className="after:absolute after:inset-0 after:z-10"
              data-testid={`article-card-${article.slug}`}
            >
              {article.title}
            </Link>
          </h3>
          {article.excerpt && (
            <p className="text-sm text-jepang-muted line-clamp-2 mb-4">
              {article.excerpt}
            </p>
          )}
          <div className="mt-auto pt-3 border-t border-jepang-border flex items-center justify-between text-xs text-jepang-muted font-mono uppercase tracking-wider relative z-20">
            <AuthorLink username={article.author?.username} className="hover:text-jepang-red">
              {article.author?.name || "Jepangku"}
            </AuthorLink>
            <span className="flex items-center gap-1">
              <Eye size={12} strokeWidth={1.5} /> {viewCount}
            </span>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
