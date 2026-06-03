const POLL_TYPE = ["POLLING", "VOTING"];

// ── Option pools per tema ─────────────────────────────────────────────────
const CITY_OPTIONS    = ["Tokyo", "Kyoto", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Hiroshima", "Okinawa"];
const FOOD_OPTIONS    = ["Ramen", "Sushi", "Takoyaki", "Tempura", "Udon", "Soba", "Wagyu Steak", "Matcha Dessert"];
const ANIME_OPTIONS   = ["Chainsaw Man", "Spy x Family", "Demon Slayer", "Jujutsu Kaisen", "One Piece", "Bleach", "Naruto", "Haikyu!!"];
const STUDIO_OPTIONS  = ["Studio Ghibli", "MAPPA", "Kyoto Animation", "Ufotable", "Wit Studio", "A-1 Pictures", "Madhouse", "Tatsunoko"];
const GACHA_OPTIONS   = ["Genshin Impact", "Fate/Grand Order", "Granblue Fantasy", "Blue Archive", "Arknights", "Honkai Star Rail"];
const EXPERIENCE_OPTIONS = ["Onsen", "Matsuri", "Cosplay Event", "Gacha Museum", "Arcade Retro", "Hanami Picnic", "Food Market Tour"];

// ── Thumbnails per tema (Unsplash public) ─────────────────────────────────
const THUMBNAILS = {
  city:       ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
                "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
                "https://images.unsplash.com/photo-1565130838609-c3a86655db61?w=800&q=80"],
  food:       ["https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&q=80",
                "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&q=80",
                "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=80"],
  anime:      ["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
                "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80",
                "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=800&q=80"],
  studio:     ["https://images.unsplash.com/photo-1612036782180-6f0822045d55?w=800&q=80",
                "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80"],
  gacha:      ["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
                "https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=800&q=80"],
  experience: ["https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
                "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
                "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&q=80"],
};

// ── Gambar per opsi (hanya city & food) ──────────────────────────────────
const CITY_IMAGES = [
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80",
  "https://images.unsplash.com/photo-1565130838609-c3a86655db61?w=400&q=80",
  "https://images.unsplash.com/photo-1570521462033-3015e76e7432?w=400&q=80",
  "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?w=400&q=80",
  "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&q=80",
  "https://images.unsplash.com/photo-1599639668273-3296f65a70e3?w=400&q=80",
  "https://images.unsplash.com/photo-1534957753291-b2e2f0c01b18?w=400&q=80",
];
const FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&q=80",
  "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&q=80",
  "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80",
  "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
  "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80",
  "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&q=80",
  "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80",
  "https://images.unsplash.com/photo-1515823662972-da6a2ab5c2ab?w=400&q=80",
];

// Indeks poll yang mendapat thumbnail
const THUMBNAIL_INDICES     = new Set([0, 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32]);
// Indeks poll yang opsinya punya gambar (hanya city & food)
const IMAGE_OPTION_INDICES  = new Set([0, 6, 12, 18, 24, 30]);
// Indeks poll yang punya lebih dari 1 pertanyaan (multi-question)
const MULTI_Q_INDICES       = new Set([1, 4, 7, 10, 13, 16, 19, 22]);

// ── Helpers ───────────────────────────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function uniqPick(arr, count, rng) {
  const copy = [...arr];
  const out = [];
  while (out.length < count && copy.length > 0) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return out;
}

// ── Templates pertanyaan per tema ─────────────────────────────────────────
const Q_TEMPLATES = {
  city: [
    "Kota di Jepang favoritmu untuk liburan?",
    "Kalau bisa ke satu kota dulu, pilih yang mana?",
    "Kota mana yang paling berkesan menurutmu?",
    "Kota mana yang ingin kamu kunjungi lagi?",
    "Kota mana yang paling cocok untuk bulan madu?",
  ],
  food: [
    "Makanan Jepang yang paling ingin kamu coba?",
    "Kuliner Jepang favoritmu apa?",
    "Kalau makan sekali, pilih yang mana?",
    "Makanan Jepang mana yang paling enak menurutmu?",
    "Kalau ke Jepang, makanan pertama yang kamu cari apa?",
  ],
  anime: [
    "Anime mana yang paling kamu rekomendasikan?",
    "Anime favoritmu dari daftar ini yang mana?",
    "Kalau harus pilih satu, kamu pilih apa?",
    "Anime mana yang paling berkesan bagimu?",
    "Anime mana yang paling layak dapat season baru?",
  ],
  studio: [
    "Studio anime favoritmu yang paling konsisten?",
    "Studio mana yang paling kamu suka?",
    "Kalau cari kualitas animasi, ke studio mana?",
    "Studio mana yang paling sering mengecewakan?",
  ],
  gacha: [
    "Game gacha mana yang paling bikin kamu betah?",
    "Pilihan gacha kamu apa?",
    "Kalau lagi mood gacha, kamu buka yang mana?",
    "Game gacha mana yang paling worth spent waktu?",
  ],
  experience: [
    "Pengalaman Jepang mana yang paling kamu incar?",
    "Kalau datang ke Jepang, kamu pengen coba yang mana?",
    "Aktivitas mana yang paling wajib dicoba menurutmu?",
    "Pengalaman mana yang paling susah dilupakan?",
  ],
};

function pickQuestion(kind, idx, used) {
  const pool = Q_TEMPLATES[kind] || ["Pilihan kamu yang mana?"];
  for (let i = 0; i < pool.length; i++) {
    const candidate = pool[(idx + i) % pool.length];
    if (!used.has(candidate)) { used.add(candidate); return candidate; }
  }
  return pool[idx % pool.length];
}

function buildOptions(kind, rng, pollIndex) {
  const textPools   = { city: CITY_OPTIONS, food: FOOD_OPTIONS, anime: ANIME_OPTIONS, studio: STUDIO_OPTIONS, gacha: GACHA_OPTIONS, experience: EXPERIENCE_OPTIONS };
  const imagePools  = { city: CITY_IMAGES, food: FOOD_IMAGES };

  const textPool  = textPools[kind] || CITY_OPTIONS;
  const imagePool = imagePools[kind] || null;
  const useImages = IMAGE_OPTION_INDICES.has(pollIndex) && imagePool !== null;

  const count   = clamp(4 + Math.floor(rng() * 3), 4, 6);
  const picked  = uniqPick(textPool, count, rng);

  return picked.map((text) => {
    const textIdx  = textPool.indexOf(text);
    const imageUrl = useImages && textIdx >= 0 && imagePool[textIdx] ? imagePool[textIdx] : null;
    return { optionText: text, imageUrl };
  });
}

// ── Build SAMPLE_POLLS ────────────────────────────────────────────────────
const SAMPLE_POLLS = (() => {
  const target = 70;
  const out    = [];
  const kinds  = ["city", "food", "anime", "studio", "gacha", "experience"];

  for (let i = 0; i < target; i++) {
    const rng       = mulberry32(9001 + i * 1337);
    const kind      = kinds[i % kinds.length];
    const pollType  = POLL_TYPE[i % POLL_TYPE.length];
    const isMultiQ  = MULTI_Q_INDICES.has(i);

    const usedQ = new Set();

    // Pertanyaan pertama
    const q1 = {
      questionText: pickQuestion(kind, i, usedQ),
      imageUrl: null,
      options: buildOptions(kind, rng, i),
    };

    // Pertanyaan kedua (hanya untuk multi-Q polls)
    let questions = [q1];
    if (isMultiQ) {
      const rng2 = mulberry32(9001 + i * 1337 + 777);
      const q2 = {
        questionText: pickQuestion(kind, i + 1, usedQ),
        imageUrl: null,
        options: buildOptions(kind, rng2, i),
      };
      questions = [q1, q2];
    }

    const pointsReward = 3 + Math.floor(rng() * 8);
    const title        = q1.questionText; // judul poll = pertanyaan pertama
    const firstOpt     = q1.options[0].optionText;
    const slug_base    = `seed-${kind}-${i}-${firstOpt.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const thumbnailUrl = THUMBNAIL_INDICES.has(i)
      ? (THUMBNAILS[kind] || THUMBNAILS.city)[i % (THUMBNAILS[kind] || THUMBNAILS.city).length]
      : null;

    out.push({
      title,
      slug_base,
      description: `Poll seeded untuk komunitas — kategori: ${kind}.`,
      pollType,
      pointsReward,
      thumbnailUrl,
      questions,
    });
  }

  return out;
})();

module.exports = SAMPLE_POLLS;
