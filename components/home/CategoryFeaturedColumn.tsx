import Image from "next/image";
import Link from "next/link";
import AuthorLink from "@/components/AuthorLink";
import { formatArticleDate } from "@/lib/home/format-article-date";
import type { EditorialFeaturedColumn } from "@/lib/home/types";
import { Clock, User } from "lucide-react";

type CategoryFeaturedColumnProps = {
  column: EditorialFeaturedColumn;
};

export default function CategoryFeaturedColumn({
  column,
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
          View More
        </Link>
      </div>

      {featured ? (
        <Link
          href={`/articles/${featured.slug}`}
          className="group relative block overflow-hidden rounded-lg aspect-16/10 mb-4"
          data-testid={`editorial-featured-main-${slug}`}
        >
          {featured.coverImageUrl ? (
            <Image
              src={featured.coverImageUrl}
              alt={featured.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-jepang-navy" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-white">
            {featured.category ? (
              <span className="inline-block mb-2 rounded-sm bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {featured.category.name}
              </span>
            ) : null}
            <h4 className="font-heading font-black text-lg md:text-2xl tracking-tight line-clamp-2 group-hover:text-jepang-red transition-colors">
              {featured.title}
            </h4>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-zinc-300 font-mono uppercase tracking-wider">
              {featured.author ? (
                <span className="inline-flex items-center gap-1">
                  <User size={12} strokeWidth={1.5} />
                  <AuthorLink
                    username={featured.author.username}
                    className="hover:text-white relative z-10"
                  >
                    {featured.author.name}
                  </AuthorLink>
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Clock size={12} strokeWidth={1.5} />
                {formatArticleDate(featured.publishedAt)}
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <div className="rounded-lg border border-dashed border-jepang-border bg-jepang-off-white aspect-16/10 mb-4 flex items-center justify-center text-sm text-jepang-muted">
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
              {article.coverImageUrl ? (
                <Image
                  src={article.coverImageUrl}
                  alt={article.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-jepang-muted">
                  —
                </div>
              )}
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
