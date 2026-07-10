/**
 * Generate SQL untuk update judul + URL gambar seeder di database produksi.
 * Cocokkan kuis/poll lewat slug_base (bukan judul), karena slug stabil per indeks.
 *
 * Usage: node prisma/seeder/generate-sync-images-sql.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const articles = require("./data/articles.js");
const quizzes = require("./data/quizzes.js");
const polls = require("./data/polls.js");

function esc(s) {
  return String(s).replace(/'/g, "''");
}

function slugPrefix(slugBase) {
  return slugBase
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function slugLikePattern(slugBase) {
  return `${slugPrefix(slugBase)}-%`;
}

const lines = ["BEGIN;"];

for (const a of articles) {
  lines.push(
    `UPDATE articles SET cover_image_url = '${esc(a.cover_image_url)}' WHERE title = '${esc(a.title)}';`,
  );
}

for (const q of quizzes) {
  const pattern = slugLikePattern(q.slug_base);
  lines.push(
    `UPDATE quizzes SET title = '${esc(q.title)}', description = '${esc(q.description)}', thumbnail_url = '${esc(q.thumbnailUrl)}' WHERE slug LIKE '${esc(pattern)}' AND created_by = 'seed_admin_jepangku';`,
  );
}

for (const p of polls) {
  const pattern = slugLikePattern(p.slug_base);
  lines.push(
    `UPDATE polls SET title = '${esc(p.title)}', description = '${esc(p.description)}', thumbnail_url = '${esc(p.thumbnailUrl)}' WHERE slug LIKE '${esc(pattern)}' AND created_by = 'seed_admin_jepangku';`,
  );

  for (const qq of p.questions) {
    for (const o of qq.options) {
      if (!o.imageUrl) continue;
      lines.push(
        `UPDATE poll_options po SET image_url = '${esc(o.imageUrl)}' FROM poll_questions pq, polls pl WHERE po.question_id = pq.id AND pq.poll_id = pl.id AND pl.slug LIKE '${esc(pattern)}' AND pl.created_by = 'seed_admin_jepangku' AND pq.question_text = '${esc(qq.questionText)}' AND po.option_text = '${esc(o.optionText)}';`,
      );
    }
  }
}

lines.push("COMMIT;");

const out = path.join(__dirname, "sync-images.sql");
fs.writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Wrote ${lines.length - 2} statements to ${out}`);
