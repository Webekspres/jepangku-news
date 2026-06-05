const { IMAGES } = require("./images.js");

const QUIZ_TYPE = "trivia";

const THUMBNAILS = IMAGES.quizThumbnails;

const TOPICS = [
  "Anime Klasik",
  "Budaya Jepang",
  "Kuliner Jepang",
  "Manga Ikonik",
  "Tempat Wisata",
  "Teknologi Pop",
  "Bahasa Jepang",
];

const QUESTION_BANK = [
  {
    q: "Siapa pencipta manga Dragon Ball?",
    correct: "Akira Toriyama",
    wrong: ["Eiichiro Oda", "Masashi Kishimoto", "Hajime Isayama"],
  },
  {
    q: "Anime 'Spirited Away' diproduksi oleh studio?",
    correct: "Studio Ghibli",
    wrong: ["Kyoto Animation", "MAPPA", "Madhouse"],
  },
  {
    q: "Apa nama karakter utama anime Naruto?",
    correct: "Naruto Uzumaki",
    wrong: ["Sasuke Uchiha", "Kakashi Hatake", "Sakura Haruno"],
  },
  {
    q: "Berapa jumlah karakter Hiragana dasar dalam bahasa Jepang?",
    correct: "46",
    wrong: ["26", "52", "100"],
  },
  {
    q: "Festival apa yang dirayakan dengan melihat bunga sakura bersama?",
    correct: "Hanami",
    wrong: ["Matsuri", "Obon", "Tanabata"],
  },
  {
    q: "Mie Jepang mana yang terbuat dari tepung buckwheat?",
    correct: "Soba",
    wrong: ["Ramen", "Udon", "Somen"],
  },
  {
    q: "Apa nama teknik memasak Jepang yang menggunakan arang binchotan?",
    correct: "Yakitori",
    wrong: ["Tempura", "Shabu-shabu", "Sukiyaki"],
  },
  {
    q: "Sushi jenis apa yang berbentuk kerucut dari nori?",
    correct: "Temaki",
    wrong: ["Nigiri", "Maki", "Gunkan"],
  },
  {
    q: "Wagyu grade A5 memiliki skor marbling BMS berapa?",
    correct: "8-12",
    wrong: ["1-3", "4-6", "13-15"],
  },
  {
    q: "Siapa kapten bajak laut dalam manga One Piece?",
    correct: "Monkey D. Luffy",
    wrong: ["Roronoa Zoro", "Portgas D. Ace", "Trafalgar Law"],
  },
  {
    q: "Manga Berserk diciptakan oleh siapa?",
    correct: "Kentaro Miura",
    wrong: ["Hirohiko Araki", "Naoki Urasawa", "Takehiko Inoue"],
  },
  {
    q: "Apa nama teknik andalan Naruto Uzumaki?",
    correct: "Rasengan",
    wrong: ["Chidori", "Amaterasu", "Susanoo"],
  },
  {
    q: "Dalam manga Death Note, siapa nama shinigami yang menjatuhkan Death Note?",
    correct: "Ryuk",
    wrong: ["Rem", "Gelus", "Sidoh"],
  },
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

function pickN(arr, n, rng) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function buildOptions(bankItem, rng) {
  const wrong = [...bankItem.wrong];
  // ensure 3 wrong options
  const chosenWrong = pickN(wrong, 3, rng);
  const all = [
    { text: bankItem.correct, isCorrect: true },
    ...chosenWrong.map((w) => ({ text: w, isCorrect: false })),
  ];

  // shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

const SAMPLE_QUIZZES = (() => {
  const target = 60;
  const out = [];

  for (let i = 0; i < target; i++) {
    const rng = mulberry32(4242 + i * 1013);
    const topic = TOPICS[i % TOPICS.length];

    const questionsCount = clamp(4 + Math.floor(rng() * 3), 4, 7);
    const questionItems = pickN(QUESTION_BANK, questionsCount, rng);

    const pointsReward = 8 + Math.floor(rng() * 18); // 8..25
    const correctAnswerPoints = 4 + Math.floor(rng() * 6); // 4..9

    out.push({
      title: `[${topic}] Trivia Jepang #${i + 1}`,
      slug_base: `trivia-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i + 1}`,
      description: `Kuis trivia Jepang bertema: ${topic}. Coba jawab dan lihat skormu!`,
      thumbnailUrl: THUMBNAILS[i % THUMBNAILS.length],
      quizType: QUIZ_TYPE,
      pointsReward,
      correctAnswerPoints,
      questions: questionItems.map((qi) => ({
        q: qi.q,
        opts: buildOptions(qi, rng),
      })),
    });
  }

  return out;
})();

module.exports = SAMPLE_QUIZZES;
