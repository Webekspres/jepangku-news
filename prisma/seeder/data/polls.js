const { IMAGES } = require("./images.js");

const POLL_TYPE = ["POLLING", "VOTING"];

// ── Option pools per tema ─────────────────────────────────────────────────
const CITY_OPTIONS    = ["Tokyo", "Kyoto", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Hiroshima", "Okinawa"];
const FOOD_OPTIONS    = ["Ramen", "Sushi", "Takoyaki", "Tempura", "Udon", "Soba", "Wagyu Steak", "Matcha Dessert"];
const ANIME_OPTIONS   = ["Chainsaw Man", "Spy x Family", "Demon Slayer", "Jujutsu Kaisen", "One Piece", "Bleach", "Naruto", "Haikyu!!"];
const STUDIO_OPTIONS  = ["Studio Ghibli", "MAPPA", "Kyoto Animation", "Ufotable", "Wit Studio", "A-1 Pictures", "Madhouse", "Tatsunoko"];
const GACHA_OPTIONS   = ["Genshin Impact", "Fate/Grand Order", "Granblue Fantasy", "Blue Archive", "Arknights", "Honkai Star Rail"];
const EXPERIENCE_OPTIONS = ["Onsen", "Matsuri", "Cosplay Event", "Gacha Museum", "Arcade Retro", "Hanami Picnic", "Food Market Tour"];

const THUMBNAILS = IMAGES.pollThumbnails;
const CITY_IMAGES = IMAGES.pollOptionImages.city;
const FOOD_IMAGES = IMAGES.pollOptionImages.food;

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
