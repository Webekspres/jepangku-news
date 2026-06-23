"use client";

import type { FormEvent, ReactNode } from "react";
import { ArrowDownUp, ChevronDown, FolderOpen, Search, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import PopularTags from "@/components/PopularTags";
import CategorySubscribeButton from "@/components/CategorySubscribeButton";

type Category = { id: string; name: string; slug: string };

const sortOptions = [
  { value: "latest", label: "Terbaru" },
  { value: "popular", label: "Populer" },
  { value: "trending", label: "Trending" },
] as const;

type ArticleListFiltersProps = {
  search: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  sort: string;
  category: string;
  tag: string;
  categories: Category[];
  categoriesLoading: boolean;
  activeCategory?: Category;
  onUpdateParams: (updates: Record<string, string>) => void;
};

type ArticleListSearchProps = {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  className?: string;
};

export function ArticleListSearch({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  className,
}: ArticleListSearchProps) {
  return (
    <form onSubmit={onSearchSubmit} className={cn("flex gap-2", className)}>
      <Input
        type="text"
        placeholder="Cari artikel..."
        className="flex-1"
        value={searchInput}
        onChange={(e) => onSearchInputChange(e.target.value)}
        data-testid="search-input"
      />
      <Button
        type="submit"
        variant="default"
        size="icon"
        data-testid="search-submit"
        aria-label="Cari artikel"
      >
        <Search size={16} strokeWidth={2} />
      </Button>
    </form>
  );
}

function FilterSectionLabel({
  icon,
  label,
  tone = "red",
}: {
  icon: ReactNode;
  label: string;
  tone?: "red" | "navy";
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className={tone === "red" ? "text-jepang-red" : "text-jepang-navy"}>{icon}</span>
      <p className={tone === "red" ? "section-label" : "small-caps"}>{label}</p>
    </div>
  );
}

export default function ArticleListFilters({
  search: _search,
  searchInput: _searchInput,
  onSearchInputChange: _onSearchInputChange,
  onSearchSubmit: _onSearchSubmit,
  sort,
  category,
  tag,
  categories,
  categoriesLoading,
  activeCategory,
  onUpdateParams,
}: ArticleListFiltersProps) {

  return (
    <div className="space-y-4" data-testid="article-filters">
      <div>
        <FilterSectionLabel
          icon={<ArrowDownUp size={14} strokeWidth={1.5} />}
          label="Urutkan"
          tone="navy"
        />
        <div className="grid grid-cols-3 gap-1" role="tablist" aria-label="Urutkan artikel">
          {sortOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={sort === value}
              onClick={() => onUpdateParams({ sort: value })}
              className={cn(
                "rounded-md border px-2 py-2 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer",
                sort === value
                  ? "border-jepang-red bg-jepang-red/10 text-jepang-red"
                  : "border-jepang-border text-jepang-muted hover:border-foreground hover:text-foreground",
              )}
              data-testid={`sort-${value}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {(category || tag) ? (
        <div
          className="space-y-2 rounded-lg border border-dashed border-jepang-border bg-jepang-off-white px-3 py-2"
          data-testid="active-filters"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-jepang-muted">
            Filter aktif
          </span>
          <div className="flex flex-wrap gap-1.5">
            {category && activeCategory ? (
              <button
                type="button"
                onClick={() => onUpdateParams({ category: "" })}
                className="rounded-md border border-jepang-orange/40 bg-jepang-orange/10 px-2 py-1 text-xs font-semibold text-jepang-navy hover:border-jepang-orange"
                data-testid="clear-category-filter"
              >
                {activeCategory.name} <span className="text-jepang-muted">×</span>
              </button>
            ) : null}
            {tag ? (
              <button
                type="button"
                onClick={() => onUpdateParams({ tag: "" })}
                className="rounded-md border border-jepang-red/40 bg-jepang-red/10 px-2 py-1 text-xs font-mono font-semibold uppercase text-jepang-red hover:border-jepang-red"
                data-testid="clear-tag-filter"
              >
                #{tag} <span className="text-jepang-muted">×</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div>
        <FilterSectionLabel
          icon={<FolderOpen size={14} strokeWidth={1.5} />}
          label="Kategori"
        />
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            size="sm"
            variant={!category ? "default" : "outline"}
            className="h-8 w-full px-2 text-xs"
            onClick={() => onUpdateParams({ category: "" })}
            data-testid="filter-all"
          >
            Semua
          </Button>
          {categoriesLoading
            ? [...Array(4)].map((_, idx) => (
                <span
                  key={`cat-skel-${idx}`}
                  className="h-8 animate-pulse rounded-lg border border-jepang-border bg-jepang-off-white"
                />
              ))
            : categories.map((cat) => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={category === cat.slug ? "default" : "outline"}
                  className="h-8 w-full px-2 text-xs"
                  onClick={() => onUpdateParams({ category: cat.slug })}
                  data-testid={`filter-${cat.slug}`}
                >
                  {cat.name}
                </Button>
              ))}
        </div>

        {category && activeCategory ? (
          <div
            className="mt-3 space-y-2 rounded-lg border border-jepang-border bg-jepang-off-white px-3 py-2"
            data-testid="category-subscribe-banner"
          >
            <p className="text-xs text-jepang-muted">
              Notifikasi <strong className="text-foreground">{activeCategory.name}</strong>
            </p>
            <CategorySubscribeButton
              categorySlug={category}
              categoryName={activeCategory.name}
            />
          </div>
        ) : null}
      </div>

      <div>
        <FilterSectionLabel
          icon={<TagIcon size={14} strokeWidth={1.5} />}
          label="Tag populer"
          tone="navy"
        />
        <PopularTags
          limit={10}
          title={null}
          selectedSlug={tag}
          onTagSelect={(slug) => onUpdateParams({ tag: slug === tag ? "" : slug })}
        />
      </div>
    </div>
  );
}

/** Mobile collapsible — hanya filter, search ada di atas halaman */
export function ArticleListFiltersMobile(props: ArticleListFiltersProps) {
  return (
    <details className="group mb-4 overflow-hidden rounded-lg border border-jepang-border bg-white lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-jepang-navy marker:content-none">
        <span>Filter artikel</span>
        <ChevronDown
          size={16}
          className="text-jepang-muted transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-jepang-border px-4 pb-4 pt-3">
        <ArticleListFilters {...props} />
      </div>
    </details>
  );
}
