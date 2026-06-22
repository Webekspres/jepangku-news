import Link from "next/link";
import { ChevronRight } from "lucide-react";

type QuizBreadcrumbProps = {
  isLoading: boolean;
  title?: string;
};

export default function QuizBreadcrumb({ isLoading, title }: QuizBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex min-w-0 flex-wrap items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em]"
      data-testid="quiz-breadcrumb"
    >
      <Link
        href="/quizzes"
        className="shrink-0 text-jepang-muted transition-colors hover:text-jepang-red"
        data-testid="breadcrumb-quizzes"
      >
        Kuis
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
