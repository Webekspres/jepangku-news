/**
 * Sample Jepangku TV videos — public YouTube embeds (budaya & lifestyle Jepang).
 * Idempotent: seed uses upsert on slug.
 */
const VIDEOS_DATA = [
  {
    slug: "panduan-wisata-tokyo-pemula",
    title: "Panduan Wisata Tokyo untuk Pemula",
    description:
      "Tips perjalanan pertama ke Tokyo — transportasi, akomodasi, dan spot wajib kunjung untuk traveler Indonesia.",
    youtubeId: "yhe6CZt3Zns",
    status: "PUBLISHED",
    isFeatured: true,
    viewCount: 12840,
    daysAgo: 2,
  },
  {
    slug: "makanan-jalanan-kyoto",
    title: "Makanan Jalanan Kyoto yang Wajib Dicoba",
    description:
      "Jelajahi pasar tradisional dan street food ikonik Kyoto — dari dango hingga yuba segar.",
    youtubeId: "9jtU-Pum7eE",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 8650,
    daysAgo: 5,
  },
  {
    slug: "etika-onsen-jepang",
    title: "Budaya Onsen: Etika yang Perlu Diketahui",
    description:
      "Panduan singkat tata krama di pemandian air panas Jepang agar pengalamanmu nyaman dan sopan.",
    youtubeId: "NWesZr5W-nE",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 5420,
    daysAgo: 8,
  },
  {
    slug: "anime-manga-tokyo-guide",
    title: "Anime & Manga: Spot Terbaik di Tokyo",
    description:
      "Dari Akihabara hingga Nakano Broadway — rekomendasi untuk penggemar anime dan manga.",
    youtubeId: "pFogCo2fLkE",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 15320,
    daysAgo: 12,
  },
  {
    slug: "kehidupan-sehari-hari-jepang",
    title: "Kehidupan Sehari-hari di Jepang",
    description:
      "Cuplikan rutinitas, kereta, konbini, dan kebiasaan unik masyarakat Jepang modern.",
    youtubeId: "vUbU9GrANbY",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 22100,
    daysAgo: 18,
  },
  {
    slug: "natsu-matsuri-festival",
    title: "Festival Musim Panas (Natsu Matsuri) di Jepang",
    description:
      "Suasana matsuri musim panas — yukata, kembang api, dan stan makanan khas festival.",
    youtubeId: "RrFExplNXr0",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 9870,
    daysAgo: 25,
  },
  {
    slug: "draft-video-halal-jepang",
    title: "[Draf] Kuliner Halal di Jepang",
    description: "Episode mendatang tentang restoran halal dan tips makan aman di Jepang.",
    youtubeId: "0jGrgK8MGT8",
    status: "DRAFT",
    isFeatured: false,
    viewCount: 0,
    daysAgo: 0,
  },
];

module.exports = { VIDEOS_DATA };
