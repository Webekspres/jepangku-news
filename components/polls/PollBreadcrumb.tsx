import Link from "next/link";
import { ChevronRight } from "lucide-react";

type PollBreadcrumbProps = {
  isLoading: boolean;
  title?: string;
};

export default function PollBreadcrumb({ isLoading, title }: PollBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex min-w-0 flex-wrap items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em]"
      data-testid="poll-breadcrumb"
    >
      <Link
        href="/polls"
        className="shrink-0 text-jepang-muted transition-colors hover:text-jepang-red"
        data-testid="back-to-polls"
      >
        Polls
      </Link>

      <ChevronRight size={12} className="shrink-0 text-jepang-muted" aria-hidden />

      {isLoading ? (
        <span className="h-4 w-40 max-w-[50vw] animate-pulse rounded bg-jepang-border" />
      ) : (
        <span
          className="min-w-0 truncate text-foreground uppercase tracking-normal"
          aria-current="page"
          data-testid="breadcrumb-title"
          title={title}
        >
          {title}
        </span>
      )}
    </nav>
  );
}
