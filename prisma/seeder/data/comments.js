/**
 * Generator komentar beragam untuk artikel, poll, dan quiz.
 * target_index merujuk ke urutan entitas yang sudah di-seed (0-based).
 */

const { CLERK_TEST_SAMPLE_USER_EMAIL, DUMMY_USER_EMAIL_LIST } = require("./clerk-test-emails.js");

const AUTHORS = [CLERK_TEST_SAMPLE_USER_EMAIL, ...DUMMY_USER_EMAIL_LIST.filter((e) => e !== CLERK_TEST_SAMPLE_USER_EMAIL)];

const ARTICLE_COMMENTS = [
  "Artikelnya lengkap banget, langsung bookmark!",
  "Setuju dengan poin ketiga — sangat relate.",
  "Ada sumber tambahan untuk bagian kanji? Penasaran.",
  "Tulisannya enak dibaca, tone-nya pas buat pemula.",
  "Wah baru tahu fakta ini, makasih infonya!",
  "Kurang setuju di paragraf kedua, tapi overall bagus.",
  "Kapan ada part 2-nya? Tungguin nih.",
  "Cover image-nya cakep, cocok sama temanya.",
  "Ini persis pengalaman saya waktu ke Kyoto tahun lalu.",
  "Boleh ditambah rekomendasi tempat makan di sekitar lokasi?",
  "Penjelasan timeline-nya membantu banget buat newbie.",
  "Ada typo kecil di heading ketiga, mungkin bisa dicek lagi.",
  "Kontennya fresh, beda dari artikel sejenis lain.",
  "Saya share ke grup anime kantor, pada suka.",
  "Butuh versi ringkas untuk dibaca di kereta, tapi tetap mantap.",
];

const POLL_COMMENTS = [
  "Pilihan saya Tokyo, tapi Osaka juga worth it.",
  "Susah milih — semua opsinya menarik.",
  "Hasilnya surprise, nggak nyangka mayoritas pilih itu.",
  "Poll-nya seru, bikin nostalgia trip ke Jepang.",
  "Next poll tentang makanan khas daerah dong!",
];

const QUIZ_COMMENTS = [
  "Skor saya cuma 60%, harus belajar lagi nih.",
  "Pertanyaan nomor 3 tricky banget!",
  "Quiz-nya fun, cocok buat ice breaker.",
  "Akhirnya dapat perfect score setelah retry mental.",
  "Hint-nya kurang jelas di soal terakhir menurut saya.",
];

const REPLY_COMMENTS = [
  "Setuju! Saya juga pengalaman yang sama.",
  "Bisa cek link di bio penulis, biasanya ada referensi.",
  "Makasih masukannya, akan saya coba minggu depan.",
  "Haha iya bener, itu yang bikin artikel ini beda.",
  "Part 2 lagi disusun katanya di Discord komunitas.",
  "Typo sudah dilaporkan ke admin, thanks!",
  "Coba baca komentar di bawah, ada rekomendasi bagus.",
];

const HIDDEN_COMMENTS = [
  "[moderasi] Komentar mengandung spam link — disembunyikan.",
  "[moderasi] Bahasa tidak sopan — disembunyikan sementara.",
];

const DELETED_SNIPPET = "[dihapus oleh pengguna]";

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildComments() {
  const _rng = mulberry32(4242);
  const out = [];
  let keyCounter = 0;

  const add = (spec) => {
    out.push({ key: `c-${keyCounter++}`, ...spec });
  };

  // ── Artikel: 80 komentar top-level + 25 balasan ───────────────────────
  for (let i = 0; i < 80; i++) {
    const pool = ARTICLE_COMMENTS;
    const status = i % 17 === 0 ? "HIDDEN" : "VISIBLE";
    const content =
      status === "HIDDEN"
        ? HIDDEN_COMMENTS[i % HIDDEN_COMMENTS.length]
        : i % 23 === 0
          ? DELETED_SNIPPET
          : pool[i % pool.length];

    add({
      author_email: AUTHORS[i % AUTHORS.length],
      target_type: "ARTICLE",
      target_index: i % 40,
      content,
      status,
      parent_key: null,
      days_ago: 1 + (i % 14),
      deleted: i % 23 === 0,
    });
  }

  for (let i = 0; i < 25; i++) {
    const parentIdx = i * 3;
    if (parentIdx >= 80) break;
    add({
      author_email: AUTHORS[(i + 2) % AUTHORS.length],
      target_type: "ARTICLE",
      target_index: parentIdx % 40,
      content: REPLY_COMMENTS[i % REPLY_COMMENTS.length],
      status: "VISIBLE",
      parent_key: `c-${parentIdx}`,
      days_ago: Math.max(0, (parentIdx % 14) - 1),
      deleted: false,
    });
  }

  // ── Poll: 20 komentar ───────────────────────────────────────────────────
  for (let i = 0; i < 20; i++) {
    add({
      author_email: AUTHORS[(i + 1) % AUTHORS.length],
      target_type: "POLL",
      target_index: i % 8,
      content: POLL_COMMENTS[i % POLL_COMMENTS.length],
      status: i % 11 === 0 ? "HIDDEN" : "VISIBLE",
      parent_key: null,
      days_ago: 2 + (i % 10),
      deleted: false,
    });
  }

  // ── Quiz: 20 komentar + 8 balasan ─────────────────────────────────────
  for (let i = 0; i < 20; i++) {
    add({
      author_email: AUTHORS[(i + 3) % AUTHORS.length],
      target_type: "QUIZ",
      target_index: i % 6,
      content: QUIZ_COMMENTS[i % QUIZ_COMMENTS.length],
      status: "VISIBLE",
      parent_key: null,
      days_ago: 1 + (i % 12),
      deleted: false,
    });
  }

  const quizCommentStartKey = 80 + 25 + 20; // setelah artikel + balasan artikel + poll
  for (let i = 0; i < 8; i++) {
    const parentKey = `c-${quizCommentStartKey + i}`;
    add({
      author_email: AUTHORS[i % AUTHORS.length],
      target_type: "QUIZ",
      target_index: i % 6,
      content: REPLY_COMMENTS[(i + 3) % REPLY_COMMENTS.length],
      status: "VISIBLE",
      parent_key: parentKey,
      days_ago: i % 8,
      deleted: false,
    });
  }

  return out;
}

const COMMENTS_DATA = buildComments();

module.exports = { COMMENTS_DATA };
