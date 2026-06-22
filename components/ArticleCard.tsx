"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AuthorLink from "@/components/AuthorLink";
import CardCoverImage from "@/components/CardCoverImage";
import ReactionIcon from "@/components/reactions/ReactionIcon";
import { MotionHoverScale } from "@/components/ui/motion";
import { resolveCardImageUrl } from "@/lib/image-placeholder";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  cover_image_url?: string | null;
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
  variant?: "default" | "featured" | "compact";
  priority?: boolean;
  /** Label reaksi dominan (homepage reaksi komunitas) */
  reactionBadge?: { iconSrc: string; label: string };
}

export default function ArticleCard({
  article,
  variant = "default",
  priority = false,
  reactionBadge,
}: ArticleCardProps) {
  const coverUrl = resolveCardImageUrl(
    article.coverImageUrl || article.cover_image_url,
  );
  const viewCount = article.viewCount ?? article.view_count ?? 0;
  const isHot = article.isHot ?? article.is_hot ?? false;

  if (variant === "featured") {
    return (
      <div
        className="group block relative h-115 md:h-140 overflow-hidden"
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
          <h2 className="font-heading font-black text-3xl md:text-5xl tracking-tighter mb-3 group-hover:text-jepang-red transition-colors">
            <Link
              href={`/articles/${article.slug}`}
              className="after:absolute after:inset-0 after:z-10"
              data-testid={`article-featured-${article.slug}`}
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

  return (
    <div className="group block relative h-full">
      <motion.div whileHover={{ borderColor: "var(--color-jepang-navy)" }} transition={{ duration: 0.2 }}>
      <Card className="group h-full overflow-hidden bg-white border border-jepang-border relative">
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
        </div>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            {article.category && <Badge>{article.category.name}</Badge>}
            {reactionBadge ? (
              <Badge variant="red" className="inline-flex items-center gap-1">
                <ReactionIcon src={reactionBadge.iconSrc} size={14} />
                {reactionBadge.label}
              </Badge>
            ) : null}
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
          <div className="pt-3 border-t border-jepang-border flex items-center justify-between text-xs text-jepang-muted font-mono uppercase tracking-wider relative z-20">
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
