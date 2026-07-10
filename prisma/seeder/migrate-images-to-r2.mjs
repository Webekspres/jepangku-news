/**
 * Download gambar Unsplash dari seeder, upload ke R2, ganti URL di file seeder.
 *
 * Usage (dari jepangku-news/):
 *   node prisma/seeder/migrate-images-to-r2.mjs
 *   node prisma/seeder/migrate-images-to-r2.mjs --dry-run
 *
 * Env: muat .env (R2_*, opsional SEED_IMAGE_PUBLIC_URL untuk domain produksi)
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const MANIFEST_PATH = path.join(__dirname, "image-url-manifest.json");

const DRY_RUN = process.argv.includes("--dry-run");
const PURPOSE = "cover";

const PRESET = { maxWidth: 1600, maxHeight: 1200, quality: 85 };

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

function collectUrls(val, out = new Set()) {
  if (typeof val === "string" && val.includes("images.unsplash.com")) {
    out.add(val.split("?")[0] + normalizeUnsplashQuery(val));
  } else if (Array.isArray(val)) {
    val.forEach((v) => collectUrls(v, out));
  } else if (val && typeof val === "object") {
    Object.values(val).forEach((v) => collectUrls(v, out));
  }
  return out;
}

/** Preserve w/q/fit from source URL for stable keys */
function normalizeUnsplashQuery(url) {
  try {
    const u = new URL(url);
    const w = u.searchParams.get("w") || "1200";
    const q = u.searchParams.get("q") || "85";
    const fit = u.searchParams.has("fit") ? "&fit=crop" : "";
    return `?auto=format&w=${w}&q=${q}${fit}`;
  } catch {
    return "?auto=format&w=1200&q=85&fit=crop";
  }
}

function stableKey(url) {
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 12);
  return `portal-berita/seed-system/${hash}.webp`;
}

async function downloadImage(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const ct = res.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  return { buffer: buf, contentType: ct };
}

async function optimize(buffer) {
  const optimized = await sharp(buffer, { animated: false })
    .rotate()
    .resize({
      width: PRESET.maxWidth,
      height: PRESET.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: PRESET.quality, effort: 4 })
    .toBuffer();
  return optimized;
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

function loadSeedData() {
  delete require.cache[require.resolve("./data/images.js")];
  delete require.cache[require.resolve("./data/articles.js")];
  delete require.cache[require.resolve("./data/quizzes.js")];
  delete require.cache[require.resolve("./data/polls.js")];

  const { IMAGES, PHOTOS, CITY_PHOTO_IDS, FOOD_PHOTO_IDS } = require("./data/images.js");
  const articles = require("./data/articles.js");
  const quizzes = require("./data/quizzes.js");
  const polls = require("./data/polls.js");

  return { IMAGES, PHOTOS, CITY_PHOTO_IDS, FOOD_PHOTO_IDS, articles, quizzes, polls };
}

function replaceInFile(filePath, mapping) {
  let text = fs.readFileSync(filePath, "utf8");
  let changed = 0;
  for (const [from, to] of Object.entries(mapping)) {
    const baseFrom = from.split("?")[0];
    const re = new RegExp(baseFrom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\?[^\"'`\\s]*)?", "g");
    const before = text;
    text = text.replace(re, to);
    if (text !== before) changed++;
  }
  if (changed > 0 && !DRY_RUN) {
    fs.writeFileSync(filePath, text, "utf8");
  }
  return changed;
}

async function main() {
  const { IMAGES, PHOTOS, articles, quizzes, polls } = loadSeedData();

  const urlSet = new Set();
  collectUrls(IMAGES, urlSet);
  collectUrls(PHOTOS, urlSet);
  collectUrls(articles, urlSet);
  collectUrls(quizzes, urlSet);
  collectUrls(polls, urlSet);

  const urls = [...urlSet].sort();
  console.log(`Found ${urls.length} unique Unsplash URLs`);

  let manifest = {};
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  }

  const mapping = { ...manifest };
  let uploaded = 0;
  let skipped = 0;

  for (const url of urls) {
    if (mapping[url]) {
      skipped++;
      continue;
    }

    const key = stableKey(url);
    console.log(`\n→ ${url.slice(0, 80)}...`);

    if (DRY_RUN) {
      mapping[url] = buildPublicUrl(key);
      continue;
    }

    try {
      const { buffer } = await downloadImage(url);
      const optimized = await optimize(buffer);
      const publicUrl = await uploadToR2(optimized, key);
      mapping[url] = publicUrl;
      uploaded++;
      console.log(`  ✓ ${publicUrl}`);
    } catch (err) {
      console.error(`  ✗ ${err instanceof Error ? err.message : err}`);
    }
  }

  if (!DRY_RUN) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(mapping, null, 2), "utf8");

    const reg = {};
    for (const [url, r2] of Object.entries(mapping)) {
      const match = url.match(/photo-[a-f0-9-]+/);
      if (!match) continue;
      const id = match[0];
      const u = new URL(url);
      const w = u.searchParams.get("w") || "1200";
      const q = u.searchParams.get("q") || "85";
      const fit = u.searchParams.has("fit");
      reg[`${id}|w=${w}|q=${q}${fit ? "|fit" : ""}`] = r2;
    }
    fs.writeFileSync(
      path.join(DATA_DIR, "image-r2-registry.json"),
      JSON.stringify(reg, null, 2),
      "utf8",
    );
  }

  const filesToPatch = [
    path.join(DATA_DIR, "images.js"),
    path.join(DATA_DIR, "articles.js"),
    path.join(DATA_DIR, "quizzes.js"),
    path.join(DATA_DIR, "polls.js"),
  ];

  let totalReplacements = 0;
  for (const f of filesToPatch) {
    const n = replaceInFile(f, mapping);
    totalReplacements += n;
    console.log(`Patched ${path.basename(f)}: ${n} URL pattern(s)`);
  }

  // Reload seed data after patch for entity manifest
  const refreshed = loadSeedData();
  const entityManifest = {
    articles: refreshed.articles.map((a) => ({
      title: a.title,
      coverImageUrl: a.cover_image_url,
    })),
    quizzes: refreshed.quizzes.map((q) => ({
      title: q.title,
      slugBase: q.slug_base,
      thumbnailUrl: q.thumbnailUrl,
    })),
    polls: refreshed.polls.map((p) => ({
      title: p.title,
      slugBase: p.slug_base,
      description: p.description,
      thumbnailUrl: p.thumbnailUrl,
      questions: p.questions.map((q) => ({
        questionText: q.questionText,
        options: q.options.map((o) => ({
          optionText: o.optionText,
          imageUrl: o.imageUrl,
        })),
      })),
    })),
  };
  const entityPath = path.join(__dirname, "image-entity-manifest.json");
  if (!DRY_RUN) {
    fs.writeFileSync(entityPath, JSON.stringify(entityManifest, null, 2), "utf8");
  }

  console.log(`\nDone. Uploaded: ${uploaded}, skipped (cached): ${skipped}, dry-run: ${DRY_RUN}`);
  console.log(`Entity manifest: ${entityPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
