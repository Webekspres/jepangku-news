/**
 * Revisi artikel untuk riwayat editing / my-articles.
 * target_index = urutan artikel milik user (bukan admin) yang published/pending.
 */

const { CLERK_TEST_SAMPLE_USER_EMAIL } = require("./clerk-test-emails.js");

const EDITORS = [
  CLERK_TEST_SAMPLE_USER_EMAIL,
  "siti.rahayu@gmail.com",
  "andi.wijaya@gmail.com",
  "dewi.kusuma@gmail.com",
  "rizky.pratama@gmail.com",
];

const CHANGE_NOTES = [
  "Perbaikan struktur paragraf dan penambahan subheading.",
  "Update data statistik dan sumber referensi terbaru.",
  "Revisi judul agar lebih SEO-friendly.",
  "Penambahan gambar ilustrasi dan caption.",
  "Koreksi typo serta penyederhanaan kalimat intro.",
  "Menambah bagian FAQ di akhir artikel.",
  "Penyesuaian tone agar lebih ramah pemula.",
];

const ARTICLE_REVISIONS_DATA = [];

for (let i = 0; i < 25; i++) {
  const revCount = 1 + (i % 3);
  for (let r = 0; r < revCount; r++) {
    ARTICLE_REVISIONS_DATA.push({
      target_index: i,
      editor_email: EDITORS[i % EDITORS.length],
      revision_number: r + 1,
      change_note: CHANGE_NOTES[(i + r) % CHANGE_NOTES.length],
      title_suffix: r === 0 ? "" : ` (rev ${r + 1})`,
      days_ago: 5 + i + r * 2,
    });
  }
}

module.exports = { ARTICLE_REVISIONS_DATA };
