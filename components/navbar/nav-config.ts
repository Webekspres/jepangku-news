export const NAV_LINKS = [
  { path: "/", label: "Beranda" },
  { path: "/articles", label: "Artikel" },
  { path: "/explore", label: "Jelajahi" },
  { path: "/quizzes", label: "Kuis" },
  { path: "/polls", label: "Polling" },
  { path: "/leaderboard", label: "Peringkat" },
] as const;

export const NAV_CATEGORIES = [
  { name: "Anime", slug: "anime" },
  { name: "Manga", slug: "manga" },
  { name: "Culture", slug: "culture" },
  { name: "Travel", slug: "travel" },
  { name: "Food", slug: "food" },
  { name: "Event", slug: "event" },
  { name: "Technology", slug: "technology" },
  { name: "Lifestyle", slug: "lifestyle" },
  { name: "Education", slug: "education" },
  { name: "Fun", slug: "fun" },
] as const;

export function categoryArticlesHref(slug: string) {
  return `/articles?category=${encodeURIComponent(slug)}`;
}
