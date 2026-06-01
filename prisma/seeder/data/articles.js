// NOTE: this file originally contained a small static list.
// It has been replaced with a generator to create ~300+ highly varied seeded articles.

const AUTHORS = [
  { email: "budi.santoso@gmail.com", displayName: "Budi" },
  { email: "siti.rahayu@gmail.com", displayName: "Siti" },
  { email: "andi.wijaya@gmail.com", displayName: "Andi" },
  { email: "dewi.kusuma@gmail.com", displayName: "Dewi" },
  { email: "rizky.pratama@gmail.com", displayName: "Rizky" },
  { email: "maya.indah@gmail.com", displayName: "Maya" },
  { email: "fajar.nugroho@gmail.com", displayName: "Fajar" },
  { email: "lina.hartati@gmail.com", displayName: "Lina" },
];

const CATEGORIES = [
  "anime",
  "manga",
  "culture",
  "travel",
  "food",
  "event",
  "technology",
  "lifestyle",
  "education",
  "fun",
];

const TAG_POOL = [
  "tokyo",
  "kyoto",
  "sakura",
  "shonen",
  "seinen",
  "isekai",
  "studio-ghibli",
  "mappa",
  "ramen",
  "sushi",
  "onsen",
  "cosplay",
  "kanji",
  "j-pop",
  "samurai",
  "ninja",
  "otaku",
  "doujinshi",
  "gacha",
  "retro-game",
];

const STATUS_DISTRIBUTION = [
  { status: "PUBLISHED", weight: 60 },
  { status: "PENDING_REVIEW", weight: 15 },
  { status: "DRAFT", weight: 10 },
  { status: "REJECTED", weight: 10 },
  { status: "ARCHIVED", weight: 5 },
];

function pickWeighted(arr, rng) {
  const total = arr.reduce((s, x) => s + x.weight, 0);
  let r = rng() * total;
  for (const item of arr) {
    r -= item.weight;
    if (r <= 0) return item.status;
  }
  return arr[arr.length - 1].status;
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function uniqPick(pool, count, rng) {
  const copy = [...pool];
  const out = [];
  while (out.length < count && copy.length > 0) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return out;
}

function makeContentBlock(category, i) {
  // Keep content short-ish but still HTML.
  const blocks = [
    `<!— Seeded content ${i} —>`,
    `<p>${category[0].toUpperCase() + category.slice(1)} adalah tema yang selalu menarik di Jepang. Di artikel ini, kita bahas rangkuman yang ringan namun informatif.</p>`,
    `<h2>Highlights</h2><ul>`,
    `<li>Aspek tren: update dari komunitas dan pengalaman langsung pembaca.</li>`,
    `<li>Angka & insight: lihat pola yang sering muncul saat membahas ${category}.</li>`,
    `<li>Checklist: langkah praktis yang bisa kamu coba minggu ini.</li>`,
    `</ul>`,
    `<h2>Penutup</h2><p>Semoga artikel ini membantu kamu menemukan perspektif baru tentang ${category} di Jepang.</p>`,
  ];
  return blocks.join("");
}

function titleFor(category, i, author) {
  const topics = {
    anime: [
      "Musim Baru",
      "Rekomendasi",
      "Studio",
      "Karakter Ikonik",
      "Adaptasi",
    ],
    manga: [
      "Panduan Membaca",
      "Top Series",
      "Gaya Seni",
      "Alur Cerita",
      "Komunitas",
    ],
    culture: ["Ikigai", "Tradisi", "Etika", "Festival", "Budaya Pop"],
    travel: [
      "Itinerary",
      "Tempat Wajib",
      "Tips Menghemat",
      "Rute",
      "Hidden Gems",
    ],
    food: [
      "Kuliner",
      "Etika Makan",
      "Perbandingan",
      "Bahan Rahasia",
      "Tempat Populer",
    ],
    event: ["Preview", "Tips", "Yang Harus Dibawa", "Jadwal", "Paling Dinanti"],
    technology: ["Robot", "AI", "Gadget", "Game", "Inovasi"],
    lifestyle: ["Wabi-Sabi", "Kaizen", "Mindset", "Hidup Seimbang", "Tren"],
    education: ["JLPT", "Kanji", "Belajar", "Metode", "Tips"],
    fun: ["Tes Kepribadian", "Kata Unik", "Mitos", "Quirks", "Fenomena"],
  };

  const tList = topics[category] || [
    "Panduan",
    "Rekomendasi",
    "Insight",
    "Tips",
    "Tren",
  ];
  const t = tList[i % tList.length];
  return `[${category.toUpperCase()}] ${t} #${i + 1} — versi ${author.displayName}`;
}

function excerptFor(category, i) {
  const templates = [
    `Rangkuman cepat tentang ${category} di Jepang, lengkap dengan poin-poin yang bisa kamu pakai langsung.`,
    `Artikel ini mengulas ${category} dengan sudut pandang yang berbeda: dari trend sampai checklist.`,
    `Kumpulan insight seputar ${category} (plus ide konten) agar kamu makin paham dan semangat mencoba.`,
    `Versi ringkas dari hal-hal penting tentang ${category}: apa, kenapa, dan bagaimana mulai.`,
  ];
  return templates[i % templates.length];
}

function coverUrlFor(category, i) {
  const imagesByCategory = {
    anime: [
      "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1625189659340-887baac3ea32?auto=format&fit=crop&w=1200&q=85",
    ],
    manga: [
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=85",
    ],
    culture: [
      "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85",
    ],
    travel: [
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=1200&q=85",
    ],
    food: [
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=1200&q=85",
    ],
    event: [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85",
    ],
    technology: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85",
    ],
    lifestyle: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=1200&q=85",
    ],
    education: [
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=85",
    ],
    fun: [
      "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&q=85",
    ],
  };

  const fallbackImages = [
    "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=85",
  ];

  const selectedImages = imagesByCategory[category] || fallbackImages;

  return selectedImages[i % selectedImages.length];
}

const SAMPLE_ARTICLES = (() => {
  const target = 300;
  const seedBase = 1337;
  const authorsLen = AUTHORS.length;

  const out = [];

  for (let i = 0; i < target; i++) {
    const rng = mulberry32(seedBase + i * 9973 + (i % 13));
    const category_slug = CATEGORIES[i % CATEGORIES.length];

    // status distribution
    const status = pickWeighted(STATUS_DISTRIBUTION, rng);

    // tags: vary count 2..5
    const tagCount = clamp(2 + Math.floor(rng() * 4), 2, 5);
    const tags = uniqPick(TAG_POOL, tagCount, rng);

    // featured/hot mostly when published
    const isPublished = status === "PUBLISHED";
    const isFeatured = isPublished ? rng() < 0.12 : rng() < 0.03;
    const isHot = isPublished ? rng() < 0.2 : rng() < 0.05;

    const author = AUTHORS[i % authorsLen];

    out.push({
      title: titleFor(category_slug, i, author),
      category_slug,
      tags,
      excerpt: excerptFor(category_slug, i),
      content: makeContentBlock(category_slug, i),
      cover_image_url: coverUrlFor(category_slug, i),
      is_featured: isFeatured,
      is_hot: isHot,
      status,
      author_email: author.email,
    });
  }

  return out;
})();

module.exports = SAMPLE_ARTICLES;
