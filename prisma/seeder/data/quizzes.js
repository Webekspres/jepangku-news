const { createUniquePicker } = require("./image-picker.js");

const QUIZ_TYPE = "trivia";
const picker = createUniquePicker();

const TOPICS = [
  "Anime Klasik",
  "Budaya Jepang",
  "Kuliner Jepang",
  "Manga Ikonik",
  "Tempat Wisata",
  "Teknologi Pop",
  "Bahasa Jepang",
];

/** Pool gambar per topik (utama → cadangan) */
const TOPIC_IMAGE_POOLS = {
  "Anime Klasik": ["anime", "manga", "fun"],
  "Budaya Jepang": ["culture", "event", "travel"],
  "Kuliner Jepang": ["food", "konbini"],
  "Manga Ikonik": ["manga", "anime"],
  "Tempat Wisata": ["travel", "culture"],
  "Teknologi Pop": ["technology", "gaming", "camera"],
  "Bahasa Jepang": ["education", "culture"],
};

/** 60 judul unik — tanpa template [] atau : */
const QUIZ_TITLES = [
  "Naruto dan Teknik Ninja Konoha",
  "Hanami serta Festival Musim Semi Jepang",
  "Ramen Sushi dan Wagyu dalam Satu Tes",
  "Dragon Ball serta Karya Akira Toriyama",
  "Kyoto Fushimi Inari dan Kuil Ikonik",
  "Sony PlayStation dan Era Konsol Jepang",
  "Hiragana Partikel serta Dasar JLPT",
  "Studio Ghibli dan Spirited Away",
  "Onsen Omotenashi dan Tradisi Nippon",
  "Soba Yakitori serta Masakan Jalanan",
  "One Piece dan Petualangan Luffy",
  "Gunung Fuji serta Akses dari Tokyo",
  "Toyota Hybrid dan Inovasi Otomotif",
  "Katakana Kanji untuk Pemula Nihongo",
  "Karakter Anime Legendaris Sepanjang Masa",
  "Matsuri Kehidupan Sehari-hari di Jepang",
  "Temaki Sushi serta Cita Rasa Nippon",
  "Berserk dan Manga Seinen Legendaris",
  "Arashiyama Bamboo Grove serta Wisata Alam",
  "Nintendo Switch dan Dunia Gaming Jepang",
  "Kosakata Dasar serta Ujian JLPT",
  "Pahlawan Shonen dan Teknik Rasengan",
  "Etika Filosofi Wabi-Sabi hingga Kaizen",
  "Street Food Jepang dari Osaka ke Fukuoka",
  "Death Note dan Dunia Shinigami",
  "Shinkansen serta Kota-Kota Wisata",
  "Elektronik Jepang dari Walkman ke Robot",
  "Tata Bahasa Partikel Wa Ga dan Ni",
  "Film Ikonik Hayao Miyazaki",
  "Budaya Kerja dan Omotenashi di Jepang",
  "Kuliner Autentik Nippon untuk Foodie",
  "Manga Ikonik dari Shonen Jump",
  "Destinasi Wisata Populer Seluruh Nippon",
  "Gadget Teknologi Buatan Negeri Matahari Terbit",
  "Belajar Nihongo dari Nol hingga Percakapan",
  "Teknik Ninja dan Desa Konoha",
  "Festival Gion serta Upacara Tradisional",
  "Wagyu Ramen Udon Pilihan Pecinta Kuliner",
  "Toriyama Oda dan Legenda Manga Shonen",
  "Spot Wisata Tersembunyi di Pulau Utama",
  "PlayStation Nintendo dan Industri Game",
  "Hiragana Katakana Uji Kebiasaan Pemula",
  "Anime Musim 90an hingga Klasik Modern",
  "Teh Seremoni dan Rumah Tradisional Jepang",
  "Makanan Fermentasi Natto hingga Miso",
  "Luffy Zoro dan Kru Bajak Laut Topi Jerami",
  "Onsen Hakone serta Pemandian Alam",
  "Sony Canon dan Kamera Mirrorless Jepang",
  "JLPT N5 N4 Kosakata Wajib Hafal",
  "Isekai Shonen dan Tren Anime Terkini",
  "Kimono Yukata serta Busana Tradisional",
  "Konbini Gourmet dan Tren Kuliner 2026",
  "Shinigami Death Note serta Plot Twist",
  "Prefektur Tohoku hingga Kyushu untuk Wisatawan",
  "Robot Humanoid dan Masa Depan Tech Jepang",
  "Partikel Jo De Ni dalam Kalimat Harian",
  "Naruto Shippuden serta Arc Terpopuler",
  "Kuil Torii dan Arsitektur Jepang Kuno",
  "Takoyaki Okonomiyaki serta Kuliner Osaka",
  "Attack on Titan dan Manga Phenomenon",
];

const QUESTION_BANK_BY_TOPIC = {
  "Anime Klasik": [
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
      q: "Apa nama teknik andalan Naruto Uzumaki?",
      correct: "Rasengan",
      wrong: ["Chidori", "Amaterasu", "Susanoo"],
    },
  ],
  "Budaya Jepang": [
    {
      q: "Festival apa yang dirayakan dengan melihat bunga sakura bersama?",
      correct: "Hanami",
      wrong: ["Matsuri", "Obon", "Tanabata"],
    },
    {
      q: "Tradisi mandi air panas alami di Jepang disebut?",
      correct: "Onsen",
      wrong: ["Sento", "Ryokan", "Ofuro"],
    },
    {
      q: "Istilah filosofi pelayanan tanpa pamrih di Jepang adalah?",
      correct: "Omotenashi",
      wrong: ["Kaizen", "Wabi-sabi", "Ikigai"],
    },
  ],
  "Kuliner Jepang": [
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
  ],
  "Manga Ikonik": [
    {
      q: "Siapa pencipta manga Dragon Ball?",
      correct: "Akira Toriyama",
      wrong: ["Eiichiro Oda", "Masashi Kishimoto", "Hajime Isayama"],
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
      q: "Dalam manga Death Note, siapa nama shinigami yang menjatuhkan Death Note?",
      correct: "Ryuk",
      wrong: ["Rem", "Gelus", "Sidoh"],
    },
  ],
  "Tempat Wisata": [
    {
      q: "Kuil torii merah terkenal di Kyoto berada di?",
      correct: "Fushimi Inari",
      wrong: ["Kinkaku-ji", "Senso-ji", "Todai-ji"],
    },
    {
      q: "Gunung tertinggi di Jepang adalah?",
      correct: "Fuji",
      wrong: ["Hakone", "Asama", "Aso"],
    },
    {
      q: "Kawasan bamboo grove populer untuk wisatawan ada di?",
      correct: "Arashiyama",
      wrong: ["Shibuya", "Akihabara", "Dotonbori"],
    },
    {
      q: "Shinkansen menghubungkan Tokyo dan Osaka melalui jalur?",
      correct: "Tokaido",
      wrong: ["Tohoku", "Hokuriku", "Kyushu"],
    },
  ],
  "Teknologi Pop": [
    {
      q: "Perusahaan mana yang membuat konsol PlayStation?",
      correct: "Sony",
      wrong: ["Nintendo", "Sega", "Bandai Namco"],
    },
    {
      q: "Produsen otomotif Jepang yang mempopulerkan hybrid Prius adalah?",
      correct: "Toyota",
      wrong: ["Honda", "Nissan", "Mazda"],
    },
    {
      q: "Nintendo Switch pertama kali dirilis pada tahun?",
      correct: "2017",
      wrong: ["2015", "2019", "2020"],
    },
    {
      q: "Chip dan elektronik consumer terkenal dari Jepang termasuk merek?",
      correct: "Sony",
      wrong: ["Samsung", "Intel", "Bosch"],
    },
  ],
  "Bahasa Jepang": [
    {
      q: "Berapa jumlah karakter Hiragana dasar dalam bahasa Jepang?",
      correct: "46",
      wrong: ["26", "52", "100"],
    },
    {
      q: "Partikel penanda topik dalam bahasa Jepang adalah?",
      correct: "Wa",
      wrong: ["Wo", "Ni", "De"],
    },
    {
      q: "Ujian kemampuan bahasa Jepang standar internasional disebut?",
      correct: "JLPT",
      wrong: ["NAT", "JFT", "EJU"],
    },
    {
      q: "Huruf Jepang yang dipakai untuk kata serapan asing adalah?",
      correct: "Katakana",
      wrong: ["Hiragana", "Kanji", "Romaji"],
    },
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
  const chosenWrong = pickN(wrong, 3, rng);
  const all = [
    { text: bankItem.correct, isCorrect: true },
    ...chosenWrong.map((w) => ({ text: w, isCorrect: false })),
  ];

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
    const bank = QUESTION_BANK_BY_TOPIC[topic] || [];

    const questionsCount = clamp(4 + Math.floor(rng() * 3), 4, 7);
    const questionItems = pickN(bank, Math.min(questionsCount, bank.length), rng);

    const title = QUIZ_TITLES[i];
    const slugTopic = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    out.push({
      title,
      slug_base: `trivia-${slugTopic}-${i + 1}`,
      description: `Kuis bertema ${topic}. Uji pengetahuanmu tentang topik ini!`,
      thumbnailUrl: picker.take(TOPIC_IMAGE_POOLS[topic], 1200),
      quizType: QUIZ_TYPE,
      pointsReward: 8 + Math.floor(rng() * 18),
      correctAnswerPoints: 4 + Math.floor(rng() * 6),
      questions: questionItems.map((qi) => ({
        q: qi.q,
        opts: buildOptions(qi, rng),
      })),
    });
  }

  return out;
})();

module.exports = SAMPLE_QUIZZES;
