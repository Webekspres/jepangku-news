import Link from "next/link";
import { formatArticleDate } from "@/lib/home/format-article-date";
import type { EditorialListColumn } from "@/lib/home/types";
import { Clock } from "lucide-react";

type CategoryListColumnProps = {
  column: EditorialListColumn;
};

export default function CategoryListColumn({ column }: CategoryListColumnProps) {
  const { articles, title, viewMoreHref, slug } = column;

  return (
    <article
      className="flex flex-col h-full border border-jepang-border bg-white p-5"
      data-testid={`editorial-list-${slug}`}
    >
      <h3 className="font-heading font-black text-lg md:text-xl text-jepang-red tracking-tight mb-4 pb-3 border-b border-jepang-border">
        {title}
      </h3>

      <ul className="flex-1 space-y-0">
        {articles.map((article) => (
          <li
            key={article.id}
            className="border-b border-jepang-border last:border-b-0 py-3 first:pt-0"
          >
            <Link
              href={`/articles/${article.slug}`}
              className="group block"
            >
              <p className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-jepang-red transition-colors">
                {article.title}
              </p>
              <p className="mt-1.5 text-[10px] text-jepang-muted font-mono uppercase tracking-wider inline-flex items-center gap-1">
                <Clock size={10} strokeWidth={1.5} />
                {formatArticleDate(article.publishedAt)}
              </p>
            </Link>
          </li>
        ))}
        {articles.length === 0 ? (
          <li className="py-8 text-center text-sm text-jepang-muted">
            Belum ada artikel
          </li>
        ) : null}
      </ul>

      <div className="mt-5 pt-4 border-t border-jepang-border text-center">
        <Link
          href={viewMoreHref}
          className="inline-flex rounded-full bg-jepang-red px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-jepang-red-hover transition-colors"
          data-testid={`editorial-list-view-more-${slug}`}
        >
          View More
        </Link>
      </div>
    </article>
  );
}
