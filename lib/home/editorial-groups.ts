/**
 * Editorial category groups for homepage §4 (Japanese Station-style layout).
 * Maps display groups → existing category slugs in DB.
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
    slug: "anime-manga",
    title: "Anime Manga",
    categorySlugs: ["anime", "manga", "fun"],
    primaryCategorySlug: "anime",
  },
  {
    slug: "entertainment",
    title: "Entertainment",
    categorySlugs: ["entertainment", "event", "technology"],
    primaryCategorySlug: "entertainment",
  },
];

export const EDITORIAL_LIST_GROUPS: EditorialGroupConfig[] = [
  {
    slug: "lifestyle",
    title: "Lifestyle",
    categorySlugs: ["lifestyle", "food", "travel"],
    primaryCategorySlug: "lifestyle",
  },
  {
    slug: "culture",
    title: "Culture",
    categorySlugs: ["culture", "education"],
    primaryCategorySlug: "culture",
  },
  {
    slug: "halal-in-japan",
    title: "Halal In Japan",
    categorySlugs: ["halal-in-japan"],
    primaryCategorySlug: "halal-in-japan",
  },
];

export function editorialViewMoreHref(primaryCategorySlug: string): string {
  return `/articles?category=${encodeURIComponent(primaryCategorySlug)}`;
}
