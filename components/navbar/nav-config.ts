export const NAV_LINKS = [
  { path: "/", label: "Beranda" },
  { path: "/articles", label: "Artikel" },
  { path: "/explore", label: "Jelajahi" },
  { path: "/quizzes", label: "Kuis" },
  { path: "/polls", label: "Polling" },
  { path: "/leaderboard", label: "Peringkat" },
] as const;

/** Kategori navbar — selaras soft launch (docs/soft-launch-content.md) */
export const NAV_CATEGORIES = [
  { name: "News", slug: "news" },
  { name: "Travel", slug: "travel" },
  { name: "Culture", slug: "culture" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Lifestyle", slug: "lifestyle" },
  { name: "Work in Japan", slug: "work-in-japan" },
  { name: "Study in Japan", slug: "study-in-japan" },
  { name: "Review Produk", slug: "review-produk" },
  { name: "Event", slug: "event" },
] as const;

export function categoryArticlesHref(slug: string) {
  return `/articles?category=${encodeURIComponent(slug)}`;
}
