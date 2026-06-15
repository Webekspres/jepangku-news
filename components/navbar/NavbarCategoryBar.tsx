"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NAV_CATEGORIES,
  categoryArticlesHref,
} from "@/components/navbar/nav-config";

type NavbarCategoryBarProps = {
  visible: boolean;
  onSearchOpen: () => void;
};

export default function NavbarCategoryBar({
  visible,
  onSearchOpen,
}: NavbarCategoryBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = pathname === "/articles" ? searchParams.get("category") : null;

  return (
    <div
      data-testid="navbar-category-bar"
      className={cn(
        "w-full overflow-hidden transition-all duration-500 ease-out",
        visible ? "max-h-12 opacity-100" : "max-h-0 opacity-0",
      )}
      style={{ backgroundColor: "var(--color-jepang-red)" }}
    >
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-3 px-4">
        <nav
          className="thin-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
          aria-label="Kategori artikel"
        >
          {NAV_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={categoryArticlesHref(cat.slug)}
                className={cn(
                  "shrink-0 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors",
                  isActive
                    ? "text-white underline decoration-2 underline-offset-4"
                    : "text-white/85 hover:text-white",
                )}
                data-testid={`nav-category-${cat.slug}`}
              >
                {cat.name}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onSearchOpen}
          className="shrink-0 rounded-md p-2 text-white transition-colors hover:bg-white/15 cursor-pointer"
          aria-label="Cari artikel"
          data-testid="navbar-search-btn"
        >
          <Search size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
