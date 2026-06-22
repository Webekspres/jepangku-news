/**
 * Editorial category groups for homepage §4 (Japanese Station-style layout).
 * Maps display groups → soft launch category slugs in DB.
 */
export type EditorialGroupConfig = {
  slug: string;
  title: string;
  categorySlugs: string[];
  /** Primary slug for "View More" → /articles?category= */
  primaryCategorySlug: string;
};

export const EDITORIAL_FEATURED_GROUPS: EditorialGroupConfig[] = [
  {
    slug: "news-entertainment",
    title: "News & Entertainment",
    categorySlugs: ["news", "entertainment", "event"],
    primaryCategorySlug: "news",
  },
  {
    slug: "travel-lifestyle",
    title: "Travel & Lifestyle",
    categorySlugs: ["travel", "lifestyle", "culture"],
    primaryCategorySlug: "travel",
  },
];

export const EDITORIAL_LIST_GROUPS: EditorialGroupConfig[] = [
  {
    slug: "work-study-japan",
    title: "Work & Study in Japan",
    categorySlugs: ["work-in-japan", "study-in-japan"],
    primaryCategorySlug: "work-in-japan",
  },
  {
    slug: "review-produk",
    title: "Review Produk",
    categorySlugs: ["review-produk"],
    primaryCategorySlug: "review-produk",
  },
  {
    slug: "culture",
    title: "Culture",
    categorySlugs: ["culture"],
    primaryCategorySlug: "culture",
  },
];

export function editorialViewMoreHref(primaryCategorySlug: string): string {
  return `/articles?category=${encodeURIComponent(primaryCategorySlug)}`;
}
