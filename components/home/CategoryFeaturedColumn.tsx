import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import CardCoverImage from "@/components/CardCoverImage";
import { formatArticleDate } from "@/lib/home/format-article-date";
import { resolveThumbnailUrl } from "@/lib/image-placeholder";
import type { EditorialFeaturedColumn } from "@/lib/home/types";
import { Clock } from "lucide-react";

type CategoryFeaturedColumnProps = {
  column: EditorialFeaturedColumn;
  /** Hanya kolom editorial pertama above-the-fold yang boleh priority */
  imagePriority?: boolean;
};

export default function CategoryFeaturedColumn({
  column,
  imagePriority = false,
}: CategoryFeaturedColumnProps) {
  const { featured, list, title, viewMoreHref, slug } = column;

  return (
    <article
      className="flex flex-col"
      data-testid={`editorial-featured-${slug}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-heading font-black text-xl md:text-2xl text-jepang-red tracking-tight">
          {title}
        </h3>
        <Link
          href={viewMoreHref}
          className="shrink-0 rounded-full bg-jepang-red px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-jepang-red-hover transition-colors"
          data-testid={`editorial-view-more-${slug}`}
        >
          Selengkapnya
        </Link>
      </div>

      {featured ? (
        <ArticleCard
          article={featured}
          variant="editorial"
          priority={imagePriority}
          className="mb-4"
          testId={`editorial-featured-main-${slug}`}
        />
      ) : (
        <div className="mb-4 flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-jepang-border bg-jepang-off-white text-sm text-jepang-muted">
          Belum ada artikel
        </div>
      )}

      <ul className="space-y-0 divide-y divide-jepang-border">
        {list.map((article) => (
          <li
            key={article.id}
            className="flex items-center gap-3 py-3 first:pt-0"
          >
            <Link
              href={`/articles/${article.slug}`}
              className="relative shrink-0 overflow-hidden rounded-sm bg-jepang-off-white w-[72px] h-14 md:w-20 md:h-16"
            >
              <CardCoverImage
                src={resolveThumbnailUrl(article)}
                alt={article.title}
                sizes="80px"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/articles/${article.slug}`}
                className="font-heading font-bold text-sm leading-snug line-clamp-2 hover:text-jepang-red transition-colors"
              >
                {article.title}
              </Link>
              <p className="mt-1 text-[10px] text-jepang-muted font-mono uppercase tracking-wider inline-flex items-center gap-1">
                <Clock size={10} strokeWidth={1.5} />
                {formatArticleDate(article.publishedAt)}
              </p>
            </div>
          </li>
        ))}
        {list.length === 0 && !featured ? (
          <li className="py-6 text-center text-sm text-jepang-muted">
            Belum ada artikel di kategori ini
          </li>
        ) : null}
      </ul>
    </article>
  );
}
