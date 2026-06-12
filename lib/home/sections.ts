/**
 * Canonical homepage section order — jepangku.com landing page ekosistem.
 * @see docs/feature-status.md § Rencana Landing Page
 */
export type HomeWave = 1 | 2 | 3 | 4;

export type HomeSectionId =
  | "feed"
  | "hero"
  | "today"
  | "categories-editorial"
  | "tv"
  | "ads"
  | "lms"
  | "reactions"
  | "engagement";

export type HomeSectionConfig = {
  id: HomeSectionId;
  order: number;
  wave: HomeWave | null;
  lazyEndpoint: string | null;
  label: string;
  implemented: boolean;
};

export const HOME_SECTIONS: HomeSectionConfig[] = [
  {
    id: "feed",
    order: 1,
    wave: 1,
    lazyEndpoint: "/api/home/feed",
    label: "Featured + Trending",
    implemented: true,
  },
  {
    id: "hero",
    order: 2,
    wave: null,
    lazyEndpoint: null,
    label: "Hero Ekosistem",
    implemented: true,
  },
  {
    id: "today",
    order: 3,
    wave: 1,
    lazyEndpoint: "/api/home/feed",
    label: "Artikel Hari Ini",
    implemented: true,
  },
  {
    id: "categories-editorial",
    order: 4,
    wave: 2,
    lazyEndpoint: "/api/home/categories-editorial",
    label: "Kategori Editorial",
    implemented: true,
  },
  {
    id: "tv",
    order: 5,
    wave: 3,
    lazyEndpoint: "/api/home/tv",
    label: "Jepangku TV",
    implemented: true,
  },
  {
    id: "ads",
    order: 6,
    wave: 3,
    lazyEndpoint: "/api/home/ads?slot=homepage-mid",
    label: "Advertisement",
    implemented: false,
  },
  {
    id: "lms",
    order: 7,
    wave: 3,
    lazyEndpoint: "/api/home/lms-teaser",
    label: "Belajar Bahasa Jepang",
    implemented: false,
  },
  {
    id: "reactions",
    order: 8,
    wave: 3,
    lazyEndpoint: "/api/home/reactions",
    label: "Reaksi Komunitas",
    implemented: false,
  },
  {
    id: "engagement",
    order: 9,
    wave: 4,
    lazyEndpoint: "/api/home/engagement",
    label: "Polling, Kuis & Leaderboard",
    implemented: true,
  },
];

export function getSectionConfig(id: HomeSectionId): HomeSectionConfig {
  const section = HOME_SECTIONS.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown home section: ${id}`);
  return section;
}
