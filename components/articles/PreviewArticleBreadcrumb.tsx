"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPreviewArticleBreadcrumbs,
  type PreviewBreadcrumb,
} from "@/lib/preview-article-nav";

type PreviewArticleBreadcrumbProps = {
  fromAdmin: boolean;
  articleTitle?: string | null;
  className?: string;
};

function PreviewBreadcrumbNav({
  crumbs,
  variant,
  className,
}: {
  crumbs: PreviewBreadcrumb[];
  variant: "user" | "admin";
  className?: string;
}) {
  const isAdmin = variant === "admin";

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "mb-6 flex min-w-0 flex-wrap items-center gap-1",
        isAdmin
          ? "text-sm"
          : "text-xs font-semibold uppercase tracking-[0.15em]",
        className,
      )}
      data-testid={
        isAdmin ? "preview-admin-breadcrumb" : "preview-user-breadcrumb"
      }
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <span
            key={`${crumb.label}-${index}`}
            className="flex min-w-0 items-center gap-1"
          >
            {index > 0 && (
              <ChevronRight
                size={isAdmin ? 14 : 12}
                className="shrink-0 text-jepang-muted"
                aria-hidden
              />
            )}
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className={cn(
                  "truncate transition-colors hover:text-jepang-red",
                  isAdmin
                    ? "text-jepang-muted hover:text-foreground"
                    : "text-jepang-muted",
                )}
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "min-w-0 truncate",
                  isLast
                    ? isAdmin
                      ? "font-medium text-foreground"
                      : "text-foreground uppercase tracking-normal"
                    : "text-jepang-muted",
                )}
                aria-current={isLast ? "page" : undefined}
                title={isLast ? crumb.label : undefined}
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default function PreviewArticleBreadcrumb({
  fromAdmin,
  articleTitle,
  className,
}: PreviewArticleBreadcrumbProps) {
  const crumbs = getPreviewArticleBreadcrumbs(fromAdmin, articleTitle);

  return (
    <PreviewBreadcrumbNav
      crumbs={crumbs}
      variant={fromAdmin ? "admin" : "user"}
      className={className}
    />
  );
}
