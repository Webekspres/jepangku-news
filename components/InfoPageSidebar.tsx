import Link from "next/link";
import {
  INFO_PAGE_LABELS,
  INFO_PAGE_SLUGS,
  type InfoPageSlug,
} from "@/lib/info-pages";
import { cn } from "@/lib/utils";

type InfoPageSidebarProps = {
  slug: InfoPageSlug;
  className?: string;
  variant?: "sidebar" | "mobile";
};

export default function InfoPageSidebar({
  slug,
  className,
  variant = "sidebar",
}: InfoPageSidebarProps) {
  const isMobile = variant === "mobile";

  return (
    <nav
      className={cn(
        isMobile
          ? "rounded-lg border border-jepang-border bg-white p-4 shadow-jepang lg:hidden"
          : "sticky top-24 hidden rounded-lg border border-jepang-border bg-white p-4 shadow-jepang lg:block",
        className,
      )}
      aria-label="Navigasi halaman informasi"
      data-testid={isMobile ? "info-page-sidebar-mobile" : "info-page-sidebar"}
    >
      <p className="section-label mb-3">Informasi</p>
      <ul className={cn("space-y-1", isMobile && "grid grid-cols-2 gap-1 space-y-0")}>
        {INFO_PAGE_SLUGS.map((pageSlug) => {
          const isActive = pageSlug === slug;
          return (
            <li key={pageSlug}>
              <Link
                href={`/${pageSlug}`}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-jepang-red text-white"
                    : "text-jepang-navy hover:bg-jepang-off-white hover:text-jepang-red",
                )}
                data-testid={`info-nav-${pageSlug}`}
                aria-current={isActive ? "page" : undefined}
              >
                {INFO_PAGE_LABELS[pageSlug]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
