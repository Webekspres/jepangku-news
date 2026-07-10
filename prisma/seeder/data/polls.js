const { cityPhotoUrl, foodPhotoUrl } = require("./images.js");
const { createUniquePicker } = require("./image-picker.js");

const POLL_TYPE = ["POLLING", "VOTING"];
const picker = createUniquePicker();

const CITY_OPTIONS = ["Tokyo", "Kyoto", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Hiroshima", "Okinawa"];
const FOOD_OPTIONS = ["Ramen", "Sushi", "Takoyaki", "Tempura", "Udon", "Soba", "Wagyu Steak", "Matcha Dessert"];
const ANIME_OPTIONS = ["Chainsaw Man", "Spy x Family", "Demon Slayer", "Jujutsu Kaisen", "One Piece", "Bleach", "Naruto", "Haikyu!!"];
const STUDIO_OPTIONS = ["Studio Ghibli", "MAPPA", "Kyoto Animation", "Ufotable", "Wit Studio", "A-1 Pictures", "Madhouse", "Tatsunoko"];
const GACHA_OPTIONS = ["Genshin Impact", "Fate/Grand Order", "Granblue Fantasy", "Blue Archive", "Arknights", "Honkai Star Rail"];
const EXPERIENCE_OPTIONS = ["Onsen", "Matsuri", "Cosplay Event", "Gacha Museum", "Arcade Retro", "Hanami Picnic", "Food Market Tour"];

/** 70 judul unik — tanpa template [] atau : */
const POLL_TITLES = [
  "Tokyo atau Kyoto untuk Liburan Pertamamu",
  "Ramen atau Sushi, Mana Favoritmu",
  "Anime Mana yang Paling Berkesan Tahun Ini",
  "Studio Ghibli atau MAPPA Pilih Satu",
  "Gacha Game Mana yang Paling Seru Dimainkan",
  "Onsen atau Matsuri Pengalaman Wajib Coba",
  "Osaka atau Sapporo Kota Impian Berikutnya",
  "Tempura atau Takoyaki Camilan Favorit",
  "Demon Slayer atau Jujutsu Kaisen Lebih Seru",
  "Kyoto Animation atau Ufotable Animasi Terbaik",
  "Genshin atau Honkai Star Rail Pilihanmu",
  "Hanami Picnic atau Cosplay Event More Fun",
  "Hiroshima atau Okinawa Destinasi Selanjutnya",
  "Udon atau Soba Mirip Tapi Beda Rasa",
  "One Piece atau Naruto Legenda Shonen",
  "Wit Studio atau Madhouse Kualitas Animasi",
  "Fate Grand Order atau Blue Archive",
  "Gacha Museum atau Arcade Retro Nostalgia",
  "Nagoya atau Fukuoka untuk Kuliner",
  "Wagyu Steak atau Matcha Dessert",
  "Spy x Family atau Chainsaw Man",
  "A-1 Pictures atau Tatsunoko Produksi Favorit",
  "Arknights atau Granblue Fantasy",
  "Food Market Tour atau Matsuri Malam",
  "Tokyo Malam Hari atau Kyoto Siang Hari",
  "Sushi Omakase atau Ramen Counter",
  "Bleach atau Haikyu Pilih Satu",
  "Studio Legendaris Mana yang Paling Berpengaruh",
  "Gacha Pull atau Character Build Lebih Seru",
  "Onsen Musim Dingin atau Hanami Musim Semi",
  "Hiroshima Peace atau Okinawa Beach",
  "Matcha atau Mochi Dessert Pilihan Manis",
  "Chainsaw Man atau Jujutsu Kaisen Rewatch",
  "Wit Studio atau Kyoto Animation",
  "Arknights Event atau Genshin Banner",
  "Food Market Night Tour Worth It",
  "Fukuoka atau Nagoya Street Food",
  "Wagyu atau Tempura Fine Dining",
  "Naruto atau Demon Slayer untuk Rewatch",
  "Madhouse atau Ufotable Action Scene",
  "Honkai Star Rail atau Granblue",
  "Gacha Museum atau Cosplay Convention",
  "Sapporo Snow atau Osaka Neon",
  "Soba Mie atau Udon Tebal",
  "Demon Slayer Movie atau One Piece Film",
  "A-1 Pictures Seasonal atau MAPPA Action",
  "Fate GO Summer atau Blue Archive Story",
  "Matsuri Fireworks atau Arcade Retro",
  "Tokyo Skytree atau Kyoto Tower View",
  "Ramen Tonkotsu atau Shoyu Style",
  "Spy x Family Season 2 atau Chainsaw Movie",
  "Studio Ghibli Museum atau Ghibli Park",
  "Genshin Fontaine atau Arknights Rhodes",
  "Onsen Ryokan atau Capsule Hotel Experience",
  "Sapporo Beer Garden atau Osaka Dotonbori",
  "Takoyaki Stand atau Sushi Belt",
  "Haikyu atau Spy x Family Sports vs Action",
  "Tatsunoko atau Madhouse Classic Anime",
  "Granblue Fantasy atau Honkai Gacha",
  "Cosplay Harajuku atau Comiket Day One",
  "Osaka Castle atau Hiroshima Castle",
  "Konbini Bento atau Ramen Shop Lunch",
  "Spy x Family atau Chainsaw Man Manga",
  "Kyoto Animation Violet Evergarden atau Clannad",
  "Honkai Star Rail atau Genshin Impact",
  "Cosplay Photo Spot atau Gacha Crane Game",
  "Nagoya Misokatsu atau Fukuoka Hakata Ramen",
  "Takoyaki Sauce Pedas atau Original",
  "Chainsaw Man Part 2 atau Bleach Thousand Year",
  "Studio Ghibli Totoro atau Spirited Away",
];

const KIND_LABEL = {
  city: "Kota Jepang",
  food: "Kuliner Jepang",
  anime: "Anime",
  studio: "Studio Anime",
  gacha: "Game Gacha",
  experience: "Pengalaman Jepang",
};

const KIND_IMAGE_POOLS = {
  city: ["travel"],
  food: ["food", "konbini"],
  anime: ["anime", "manga"],
  studio: ["studio", "anime", "manga"],
  gacha: ["gacha", "gaming", "fun"],
  experience: ["culture", "event", "travel", "fun"],
};

const IMAGE_OPTION_INDICES = new Set(
  Array.from({ length: 70 }, (_, i) => i).filter((i) => i % 6 === 0 || i % 6 === 1),
);
const MULTI_Q_INDICES = new Set([1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]);

const Q_TEMPLATES = {
  city: [
    "Kota favoritmu untuk liburan?",
    "Kalau bisa ke satu kota dulu, pilih yang mana?",
    "Kota mana yang paling berkesan?",
    "Kota mana yang ingin dikunjungi lagi?",
    "Kota terbaik untuk bulan madu?",
  ],
  food: [
    "Makanan Jepang yang paling ingin dicoba?",
    "Kuliner favoritmu?",
    "Kalau makan sekali, pilih yang mana?",
    "Makanan paling enak menurutmu?",
    "Makanan pertama yang dicari saat ke Jepang?",
  ],
  anime: [
    "Anime yang paling direkomendasikan?",
    "Anime favorit dari daftar ini?",
    "Anime paling berkesan?",
    "Anime yang paling layak dapat season baru?",
    "Anime terbaik untuk pemula?",
  ],
  studio: [
    "Studio anime paling konsisten?",
    "Studio anime favoritmu?",
    "Studio dengan kualitas animasi terbaik?",
    "Studio yang paling sering mengecewakan?",
  ],
  gacha: [
    "Game gacha paling bikin betah?",
    "Game gacha andalanmu?",
    "Game gacha yang paling worth waktu?",
    "Game gacha favorit saat ini?",
  ],
  experience: [
    "Pengalaman Jepang yang paling diincar?",
    "Aktivitas wajib dicoba di Jepang?",
    "Pengalaman paling susah dilupakan?",
    "Pengalaman pertama yang ingin dicoba?",
  ],
};

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

function pickQuestion(kind, idx, used) {
  const pool = Q_TEMPLATES[kind] || ["Pilihan kamu yang mana?"];
  for (let i = 0; i < pool.length; i++) {
    const candidate = pool[(idx + i) % pool.length];
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }
  return pool[idx % pool.length];
}

function pollTitle(pollIndex) {
  return POLL_TITLES[pollIndex % POLL_TITLES.length];
}

function optionImageUrl(kind, optionText) {
  if (kind === "city") return cityPhotoUrl(optionText);
  if (kind === "food") return foodPhotoUrl(optionText);
  return null;
}

function buildOptions(kind, rng, pollIndex) {
  const textPools = {
    city: CITY_OPTIONS,
    food: FOOD_OPTIONS,
    anime: ANIME_OPTIONS,
    studio: STUDIO_OPTIONS,
    gacha: GACHA_OPTIONS,
    experience: EXPERIENCE_OPTIONS,
  };

  const textPool = textPools[kind] || CITY_OPTIONS;
  const useImages = IMAGE_OPTION_INDICES.has(pollIndex) && (kind === "city" || kind === "food");
  const count = clamp(4 + Math.floor(rng() * 3), 4, 6);
  const picked = uniqPick(textPool, count, rng);

  return picked.map((text) => ({
    optionText: text,
    imageUrl: useImages ? optionImageUrl(kind, text) : null,
  }));
}

const SAMPLE_POLLS = (() => {
  const target = 70;
  const out = [];
  const kinds = ["city", "food", "anime", "studio", "gacha", "experience"];

  for (let i = 0; i < target; i++) {
    const rng = mulberry32(9001 + i * 1337);
    const kind = kinds[i % kinds.length];
    const pollType = POLL_TYPE[i % POLL_TYPE.length];
    const isMultiQ = MULTI_Q_INDICES.has(i);
    const usedQ = new Set();

    const q1Text = pickQuestion(kind, i, usedQ);
    const q1 = {
      questionText: q1Text,
      imageUrl: null,
      options: buildOptions(kind, rng, i),
    };

    let questions = [q1];
    if (isMultiQ) {
      const rng2 = mulberry32(9001 + i * 1337 + 777);
      const q2Text = pickQuestion(kind, i + 1, usedQ);
      questions = [
        q1,
        {
          questionText: q2Text,
          imageUrl: null,
          options: buildOptions(kind, rng2, i),
        },
      ];
    }

    const firstOpt = q1.options[0].optionText;
    const slug_base = `seed-${kind}-${i}-${firstOpt.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    out.push({
      title: pollTitle(i),
      slug_base,
      description: `Polling komunitas JepangKu tentang ${KIND_LABEL[kind]}.`,
      pollType,
      pointsReward: 3 + Math.floor(rng() * 8),
      thumbnailUrl: picker.take(KIND_IMAGE_POOLS[kind], 800),
      questions,
    });
  }

  return out;
})();

module.exports = SAMPLE_POLLS;
