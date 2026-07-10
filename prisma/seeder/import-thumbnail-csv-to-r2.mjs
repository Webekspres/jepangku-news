/**
 * Import thumbnail/cover images from CSV: download → R2 → update database.
 *
 * CSV format (sections):
 *   update thummbnail kuis
 *   judul, link gambar
 *   ...
 *   update thumbnail vote dan poll
 *   ...
 *   update thumbnail artikel
 *   ...
 *
 * Usage (from jepangku-news/):
 *   node prisma/seeder/import-thumbnail-csv-to-r2.mjs path/to/file.csv
 *   node prisma/seeder/import-thumbnail-csv-to-r2.mjs path/to/file.csv --dry-run
 *   node prisma/seeder/import-thumbnail-csv-to-r2.mjs path/to/file.csv --only=quiz,poll,article
 *
 * Env: DATABASE_URL, R2_* (same as migrate-images-to-r2.mjs)
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { parse as parseEnvFile } from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Monorepo root .env often has production R2 (bucket jepangku-uploads).
const rootEnvPath = path.resolve(__dirname, "../../../.env");
if (fs.existsSync(rootEnvPath)) {
  const parsed = parseEnvFile(fs.readFileSync(rootEnvPath));
  for (const key of [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_ACCESS_KEY_SECRET",
    "R2_BUCKET_NAME",
    "R2_PUBLIC_URL",
    "SEED_IMAGE_PUBLIC_URL",
  ]) {
    if (parsed[key]) process.env[key] = parsed[key];
  }
}

const DRY_RUN = process.argv.includes("--dry-run");
const WRITE_SQL = process.argv.includes("--write-sql");
const ONLY = (() => {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  if (!arg) return null;
  return new Set(arg.slice("--only=".length).split(",").map((s) => s.trim()));
})();

const PRESET = { maxWidth: 1600, maxHeight: 1200, quality: 85 };
const MANIFEST_PATH = path.join(__dirname, "thumbnail-csv-manifest.json");

const SECTION_MAP = {
  "update thummbnail kuis": "quiz",
  "update thumbnail vote dan poll": "poll",
  "update thumbnail artikel": "article",
};

function buildPublicUrl(key) {
  const base =
    process.env.SEED_IMAGE_PUBLIC_URL ||
    process.env.R2_PUBLIC_URL ||
    `https://${process.env.R2_BUCKET_NAME}.r2.cloudflarestorage.com`;
  return `${base.replace(/\/$/, "")}/${key}`;
}

const s3 =
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_ACCESS_KEY_SECRET &&
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_BUCKET_NAME
    ? new S3Client({
        region: "auto",
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_ACCESS_KEY_SECRET,
        },
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      })
    : null;

/** Extract first valid http(s) URL from messy CSV cells. */
export function extractImageUrl(raw, title = "") {
  if (!raw || typeof raw !== "string") return null;
  let s = raw.trim();
  if (!s) return null;

  // Skip when URL column is accidentally the title text
  if (s === title.trim()) return null;

  s = s.replace(/^ttps:\/\//i, "https://");

  const matches = s.match(/https?:\/\/[^\s,]+/gi);
  if (matches?.length) {
    return matches[0].replace(/[.\s]+$/, "");
  }

  if (s.startsWith("//")) return `https:${s.split(/(?=\/\/)/)[0]}`;
  return null;
}

/** Parse CSV sections into { quiz: [{title, sourceUrl}], poll: [...], article: [...] } */
export function parseThumbnailCsv(text) {
  const result = { quiz: [], poll: [], article: [] };
  let section = null;

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();
    if (SECTION_MAP[lower]) {
      section = SECTION_MAP[lower];
      continue;
    }
    if (lower === "judul, link gambar" || lower.startsWith("judul,")) continue;
    if (!section) continue;

    const commaIdx = trimmed.indexOf(",");
    if (commaIdx === -1) continue;

    const title = trimmed.slice(0, commaIdx).trim();
    const urlRaw = trimmed.slice(commaIdx + 1).trim();
    const sourceUrl = extractImageUrl(urlRaw, title);
    if (!title) continue;

    result[section].push({ title, sourceUrl, urlRaw });
  }

  return result;
}

function stableKey(type, sourceUrl) {
  const hash = crypto.createHash("sha1").update(`${type}:${sourceUrl}`).digest("hex").slice(0, 12);
  return `portal-berita/seed-system/csv-${type}-${hash}.webp`;
}

async function downloadImage(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; JepangkuThumbnailBot/1.0; +https://portal.jepangku.com)",
      Accept: "image/*,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}

async function optimize(buffer) {
  return sharp(buffer, { animated: false })
    .rotate()
    .resize({
      width: PRESET.maxWidth,
      height: PRESET.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: PRESET.quality, effort: 4 })
    .toBuffer();
}

async function uploadToR2(buffer, key) {
  if (!s3) throw new Error("R2 not configured in .env");
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return buildPublicUrl(key);
}

async function resolveR2Url(type, sourceUrl, manifest) {
  if (!sourceUrl) return null;
  const cacheKey = `${type}::${sourceUrl}`;
  if (manifest[cacheKey]) return manifest[cacheKey];

  const key = stableKey(type, sourceUrl);
  if (DRY_RUN) {
    const fake = buildPublicUrl(key);
    manifest[cacheKey] = fake;
    return fake;
  }

  console.log(`  ↓ download: ${sourceUrl.slice(0, 90)}...`);
  let raw;
  try {
    raw = await downloadImage(sourceUrl);
  } catch (err) {
    throw new Error(`download: ${err instanceof Error ? err.message : err}`);
  }

  let optimized;
  try {
    optimized = await optimize(raw);
  } catch (err) {
    throw new Error(`optimize: ${err instanceof Error ? err.message : err}`);
  }

  let publicUrl;
  try {
    publicUrl = await uploadToR2(optimized, key);
  } catch (err) {
    throw new Error(`R2 upload: ${err instanceof Error ? err.message : err}`);
  }
  manifest[cacheKey] = publicUrl;
  console.log(`  ↑ R2: ${publicUrl}`);
  return publicUrl;
}

async function findQuiz(prisma, title) {
  const exact = await prisma.quiz.findFirst({
    where: { title: { equals: title, mode: "insensitive" } },
    select: { id: true, title: true, thumbnailUrl: true },
  });
  if (exact) return exact;

  return prisma.quiz.findFirst({
    where: { title: { contains: title.slice(0, 40), mode: "insensitive" } },
    select: { id: true, title: true, thumbnailUrl: true },
  });
}

async function findPoll(prisma, title) {
  const exact = await prisma.poll.findFirst({
    where: { title: { equals: title, mode: "insensitive" } },
    select: { id: true, title: true, thumbnailUrl: true },
  });
  if (exact) return exact;

  return prisma.poll.findFirst({
    where: { title: { contains: title.slice(0, 40), mode: "insensitive" } },
    select: { id: true, title: true, thumbnailUrl: true },
  });
}

async function findArticle(prisma, title) {
  const exact = await prisma.article.findFirst({
    where: { title: { equals: title, mode: "insensitive" } },
    select: { id: true, title: true, coverImageUrl: true },
  });
  if (exact) return exact;

  return prisma.article.findFirst({
    where: { title: { contains: title.slice(0, 40), mode: "insensitive" } },
    select: { id: true, title: true, coverImageUrl: true },
  });
}

async function processSection(prisma, type, rows, manifest, stats, sqlLines) {
  const shouldRun = !ONLY || ONLY.has(type);
  if (!shouldRun) {
    console.log(`\n=== ${type.toUpperCase()} (skipped via --only) ===`);
    return;
  }

  console.log(`\n=== ${type.toUpperCase()} (${rows.length} rows) ===`);

  for (const row of rows) {
    const { title, sourceUrl, urlRaw } = row;
    console.log(`\n• ${title}`);

    if (!sourceUrl) {
      console.log(`  ✗ invalid/missing URL: ${(urlRaw || "").slice(0, 80)}`);
      stats.skipped++;
      continue;
    }

    let r2Url;
    try {
      r2Url = await resolveR2Url(type, sourceUrl, manifest);
    } catch (err) {
      console.log(`  ✗ ${err instanceof Error ? err.message : err}`);
      stats.failed++;
      continue;
    }

    let entity;
    if (type === "quiz") entity = await findQuiz(prisma, title);
    else if (type === "poll") entity = await findPoll(prisma, title);
    else entity = await findArticle(prisma, title);

    if (!entity) {
      console.log(`  ✗ not found in DB`);
      stats.notFound++;
      continue;
    }

    const field = type === "article" ? "coverImageUrl" : "thumbnailUrl";
    const current = entity[field];
    if (current === r2Url) {
      console.log(`  = already up to date (${entity.title.slice(0, 50)})`);
      stats.unchanged++;
      continue;
    }

    console.log(`  → DB update: ${entity.title.slice(0, 55)}`);
    if (!DRY_RUN) {
      if (type === "article") {
        await prisma.article.update({
          where: { id: entity.id },
          data: { coverImageUrl: r2Url },
        });
      } else if (type === "quiz") {
        await prisma.quiz.update({
          where: { id: entity.id },
          data: { thumbnailUrl: r2Url },
        });
      } else {
        await prisma.poll.update({
          where: { id: entity.id },
          data: { thumbnailUrl: r2Url },
        });
      }
    }
    stats.updated++;

    if (WRITE_SQL) {
      const esc = (s) => String(s).replace(/'/g, "''");
      if (type === "article") {
        sqlLines.push(
          `UPDATE articles SET cover_image_url = '${esc(r2Url)}' WHERE title = '${esc(entity.title)}';`,
        );
      } else if (type === "quiz") {
        sqlLines.push(
          `UPDATE quizzes SET thumbnail_url = '${esc(r2Url)}' WHERE id = '${esc(entity.id)}';`,
        );
      } else {
        sqlLines.push(
          `UPDATE polls SET thumbnail_url = '${esc(r2Url)}' WHERE id = '${esc(entity.id)}';`,
        );
      }
    }
  }
}

async function main() {
  const csvArg = process.argv.find((a) => !a.startsWith("-") && a.endsWith(".csv"));
  const csvPath = csvArg
    ? path.resolve(csvArg)
    : path.resolve(__dirname, "update-thumbnail-kuis.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const text = fs.readFileSync(csvPath, "utf8");
  const parsed = parseThumbnailCsv(text);

  let manifest = {};
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  }

  console.log(`CSV: ${csvPath}`);
  console.log(
    `Rows: quiz=${parsed.quiz.length}, poll=${parsed.poll.length}, article=${parsed.article.length}`,
  );
  console.log(`Dry run: ${DRY_RUN}`);
  console.log(`R2 bucket: ${process.env.R2_BUCKET_NAME || "(not set)"}`);
  console.log(`R2 public: ${process.env.SEED_IMAGE_PUBLIC_URL || process.env.R2_PUBLIC_URL || "(not set)"}`);

  const allInvalid = [
    ...parsed.quiz,
    ...parsed.poll,
    ...parsed.article,
  ].filter((r) => !r.sourceUrl);
  if (allInvalid.length) {
    console.log(`\nWarning: ${allInvalid.length} row(s) with invalid URL will be skipped`);
    for (const r of allInvalid) {
      console.log(`  - [${r.title}] ${(r.urlRaw || "").slice(0, 60)}`);
    }
  }

  const { createPrismaClient } = require("../create-client.js");
  const prisma = createPrismaClient();

  const stats = { updated: 0, unchanged: 0, skipped: 0, failed: 0, notFound: 0 };
  const sqlLines = ["BEGIN;"];

  try {
    await processSection(prisma, "quiz", parsed.quiz, manifest, stats, sqlLines);
    await processSection(prisma, "poll", parsed.poll, manifest, stats, sqlLines);
    await processSection(prisma, "article", parsed.article, manifest, stats, sqlLines);
  } finally {
    await prisma.$disconnect();
  }

  sqlLines.push("COMMIT;");
  const sqlPath = path.join(__dirname, "sync-thumbnail-csv.sql");
  if (WRITE_SQL && stats.updated > 0 && !DRY_RUN) {
    fs.writeFileSync(sqlPath, sqlLines.join("\n"), "utf8");
    console.log(`SQL written: ${sqlPath} (${stats.updated} updates)`);
  }

  if (!DRY_RUN) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
  }

  console.log("\n=== Summary ===");
  console.log(JSON.stringify(stats, null, 2));
  console.log(`Manifest: ${MANIFEST_PATH}`);
}

// Only run main when executed directly
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
