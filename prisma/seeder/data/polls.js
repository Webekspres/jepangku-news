const POLL_TYPE = ["POLLING", "VOTING"];

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

const CITY_OPTIONS = [
  "Tokyo",
  "Kyoto",
  "Osaka",
  "Nagoya",
  "Sapporo",
  "Fukuoka",
  "Hiroshima",
  "Okinawa",
];
const FOOD_OPTIONS = [
  "Ramen",
  "Sushi",
  "Takoyaki",
  "Tempura",
  "Udon",
  "Soba",
  "Wagyu Steak",
  "Matcha Dessert",
];
const ANIME_OPTIONS = [
  "Chainsaw Man",
  "Spy x Family",
  "Demon Slayer",
  "Jujutsu Kaisen",
  "One Piece",
  "Bleach",
  "Naruto",
  "Haikyu!!",
];
const STUDIO_OPTIONS = [
  "Studio Ghibli",
  "MAPPA",
  "Kyoto Animation",
  "Ufotable",
  "Wit Studio",
  "A-1 Pictures",
  "Madhouse",
  "Tatsunoko",
];
const GACHA_OPTIONS = [
  "Genshin Impact",
  "Fate/Grand Order",
  "Granblue Fantasy",
  "Blue Archive",
  "Arknights",
  "Honkai Star Rail",
];
const EXPERIENCE_OPTIONS = [
  "Onsen",
  "Matsuri",
  "Cosplay Event",
  "Gacha Museum",
  "Arcade Retro",
  "Hanami Picnic",
  "Food Market Tour",
];

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

function createPollTitle(i, kind) {
  const templates = {
    city: [
      "Kota di Jepang favoritmu untuk liburan?",
      "Kalau bisa ke satu kota dulu, pilih yang mana?",
      "Kota mana yang menurutmu paling “vibes” Jepang?",
    ],
    food: [
      "Makanan Jepang yang paling ingin kamu coba?",
      "Kuliner Jepang favoritmu apa?",
      "Kalau makan sekali, pilih yang mana?",
    ],
    anime: [
      "Anime mana yang paling kamu rekomendasikan?",
      "Anime favoritmu dari daftar ini yang mana?",
      "Kalau harus pilih satu, kamu pilih apa?",
    ],
    studio: [
      "Studio anime favoritmu yang paling konsisten?",
      "Studio mana yang paling kamu suka?",
      "Kalau cari kualitas animasi, ke studio mana?",
    ],
    gacha: [
      "Game gacha mana yang paling bikin kamu betah?",
      "Pilihan gacha kamu apa?",
      "Kalau lagi mood gacha, kamu buka yang mana?",
    ],
    experience: [
      "Pengalaman Jepang mana yang paling kamu incar?",
      "Kalau datang ke Jepang, kamu pengen coba yang mana?",
      "Aktivitas mana yang paling “wajib” menurutmu?",
    ],
  };

  const arr = templates[kind] || ["Pilihan kamu yang mana?"];
  return arr[i % arr.length];
}

function createOptions(kind, rng, i) {
  const pools = {
    city: CITY_OPTIONS,
    food: FOOD_OPTIONS,
    anime: ANIME_OPTIONS,
    studio: STUDIO_OPTIONS,
    gacha: GACHA_OPTIONS,
    experience: EXPERIENCE_OPTIONS,
  };

  const pool = pools[kind] || CITY_OPTIONS;
  const count = clamp(4 + Math.floor(rng() * 3), 4, 8); // 4..8 opsi
  return uniqPick(pool, count, rng);
}

function createCoverSlug(kind, i) {
  const k = kind;
  return `seed-${k}-${i}`;
}

const SAMPLE_POLLS = (() => {
  const target = 70;
  const out = [];
  const kinds = ["city", "food", "anime", "studio", "gacha", "experience"];

  for (let i = 0; i < target; i++) {
    const rng = mulberry32(9001 + i * 1337);
    const kind = kinds[i % kinds.length];
    const pollType = POLL_TYPE[i % POLL_TYPE.length];
    const options = createOptions(kind, rng, i);

    // pointsReward bervariasi: 3..10
    const pointsReward = 3 + Math.floor(rng() * 8);

    const title = createPollTitle(i, kind);
    const slug_base = `${createCoverSlug(kind, i)}-${options[0].toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    out.push({
      title,
      slug_base,
      description: `Poll seeded untuk komunitas — kategori: ${kind}.`,
      pollType,
      pointsReward,
      options,
    });
  }

  return out;
})();

module.exports = SAMPLE_POLLS;
