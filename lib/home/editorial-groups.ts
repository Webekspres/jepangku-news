/**
 * Editorial homepage layout — urutan & tipe baris tetap (bukan ranking engagement).
 * Slug harus selaras dengan prisma/seeder/data/categories.js.
 */
export type EditorialRowConfig = {
  type: "featured" | "list";
  /** Category slugs dalam urutan tampilan kiri → kanan */
  categorySlugs: string[];
  /** List row: center the grid when fewer than 3 columns (e.g. News + Culture) */
  centered?: boolean;
};

export const EDITORIAL_LAYOUT_ROWS: EditorialRowConfig[] = [
  {
    type: "featured",
    categorySlugs: ["entertainment", "review-produk"],
  },
  {
    type: "list",
    categorySlugs: ["study-in-japan", "lifestyle", "work-in-japan"],
  },
  {
    type: "featured",
    categorySlugs: ["travel", "event"],
  },
  {
    type: "list",
    categorySlugs: ["news", "culture"],
    centered: true,
  },
];

export function editorialViewMoreHref(primaryCategorySlug: string): string {
  return `/articles?category=${encodeURIComponent(primaryCategorySlug)}`;
}
