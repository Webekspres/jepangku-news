/**
 * Generator reaksi untuk artikel, poll, quiz, dan komentar (thumb up/down).
 */

const AUTHORS = [
  "budi.santoso@gmail.com",
  "siti.rahayu@gmail.com",
  "andi.wijaya@gmail.com",
  "dewi.kusuma@gmail.com",
  "rizky.pratama@gmail.com",
  "maya.indah@gmail.com",
  "fajar.nugroho@gmail.com",
  "lina.hartati@gmail.com",
];

const ARTICLE_REACTIONS = [
  "LOVE",
  "LOL",
  "CUTE",
  "WIN",
  "OMG",
  "GEEKY",
  "WTF",
  "SCARY",
  "FAIL",
];

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildReactions() {
  const rng = mulberry32(9001);
  const out = [];

  // Artikel — banyak variasi reaksi (satu user satu reaksi per target)
  for (let articleIdx = 0; articleIdx < 25; articleIdx++) {
    const userCount = 3 + (articleIdx % 5);
    for (let u = 0; u < userCount; u++) {
      const author = AUTHORS[(articleIdx + u) % AUTHORS.length];
      out.push({
        author_email: author,
        target_type: "ARTICLE",
        target_index: articleIdx,
        type: ARTICLE_REACTIONS[(articleIdx + u) % ARTICLE_REACTIONS.length],
        days_ago: Math.floor(rng() * 10),
      });
    }
  }

  // Poll — reaksi ringan
  for (let pollIdx = 0; pollIdx < 6; pollIdx++) {
    for (let u = 0; u < 4; u++) {
      out.push({
        author_email: AUTHORS[(pollIdx + u) % AUTHORS.length],
        target_type: "POLL",
        target_index: pollIdx,
        type: ["WIN", "LOVE", "LOL", "CUTE"][u % 4],
        days_ago: pollIdx + u,
      });
    }
  }

  // Quiz
  for (let quizIdx = 0; quizIdx < 5; quizIdx++) {
    for (let u = 0; u < 4; u++) {
      out.push({
        author_email: AUTHORS[(quizIdx + u + 2) % AUTHORS.length],
        target_type: "QUIZ",
        target_index: quizIdx,
        type: ["GEEKY", "WIN", "OMG", "FAIL"][u % 4],
        days_ago: quizIdx,
      });
    }
  }

  // Komentar — thumb up/down (target_index = index komentar visible di seed)
  for (let cIdx = 0; cIdx < 30; cIdx++) {
    const thumbUsers = 2 + (cIdx % 3);
    for (let u = 0; u < thumbUsers; u++) {
      const isUp = (cIdx + u) % 4 !== 0;
      out.push({
        author_email: AUTHORS[(cIdx + u + 1) % AUTHORS.length],
        target_type: "COMMENT",
        target_index: cIdx,
        type: isUp ? "THUMB_UP" : "THUMB_DOWN",
        days_ago: cIdx % 7,
      });
    }
  }

  return out;
}

const REACTIONS_DATA = buildReactions();

module.exports = { REACTIONS_DATA };
