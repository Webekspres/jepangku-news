import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categoryArticlesHref } from "@/components/navbar/nav-config";

type ArticleBreadcrumbProps = {
  isLoading: boolean;
  title?: string;
  category?: { name: string; slug: string } | null;
};

export default function ArticleBreadcrumb({
  isLoading,
  title,
  category,
}: ArticleBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex min-w-0 flex-wrap items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em]"
      data-testid="article-breadcrumb"
    >
      <Link
        href="/articles"
        className="shrink-0 text-jepang-muted transition-colors hover:text-jepang-red"
        data-testid="breadcrumb-articles"
      >
        Artikel
      </Link>

      {isLoading ? (
        <>
          <ChevronRight size={12} className="shrink-0 text-jepang-muted" aria-hidden />
          <span className="h-4 w-20 animate-pulse rounded bg-jepang-border" />
          <ChevronRight size={12} className="shrink-0 text-jepang-muted" aria-hidden />
          <span className="h-4 w-40 max-w-[50vw] animate-pulse rounded bg-jepang-border" />
        </>
      ) : (
        <>
          {category && (
            <>
              <ChevronRight size={12} className="shrink-0 text-jepang-muted" aria-hidden />
              <Link
                href={categoryArticlesHref(category.slug)}
                className="max-w-[40vw] truncate text-jepang-muted transition-colors hover:text-jepang-red sm:max-w-xs"
                data-testid="breadcrumb-category"
              >
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} className="shrink-0 text-jepang-muted" aria-hidden />
          <span
            className="min-w-0 truncate text-foreground uppercase tracking-normal"
            aria-current="page"
            data-testid="breadcrumb-title"
            title={title}
          >
            {title}
          </span>
        </>
      )}
    </nav>
  );
}
