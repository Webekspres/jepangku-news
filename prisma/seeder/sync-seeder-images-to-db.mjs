/**
 * Sinkronkan judul + URL gambar seeder ke database (artikel, kuis, poll).
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node prisma/seeder/sync-seeder-images-to-db.mjs
 */
import "dotenv/config";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const DRY_RUN = process.argv.includes("--dry-run");

function slugPrefix(slugBase) {
  return slugBase
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  delete require.cache[require.resolve("./data/articles.js")];
  delete require.cache[require.resolve("./data/quizzes.js")];
  delete require.cache[require.resolve("./data/polls.js")];

  const articles = require("./data/articles.js");
  const quizzes = require("./data/quizzes.js");
  const polls = require("./data/polls.js");

  let articleUpdates = 0;
  let quizUpdates = 0;
  let pollThumbUpdates = 0;
  let pollMetaUpdates = 0;
  let pollOptionUpdates = 0;

  console.log("=== Articles (seed titles) ===");
  for (const art of articles) {
    const row = await prisma.article.findFirst({
      where: { title: art.title },
      select: { id: true, title: true, coverImageUrl: true },
    });
    if (!row) {
      console.log(`  skip (not in DB): ${art.title.slice(0, 50)}`);
      continue;
    }
    if (row.coverImageUrl === art.cover_image_url) continue;

    console.log(`  update: ${art.title.slice(0, 55)}`);
    if (!DRY_RUN) {
      await prisma.article.update({
        where: { id: row.id },
        data: { coverImageUrl: art.cover_image_url },
      });
    }
    articleUpdates++;
  }

  console.log("\n=== Quizzes (slug_base) ===");
  for (const quiz of quizzes) {
    const row = await prisma.quiz.findFirst({
      where: {
        slug: { startsWith: `${slugPrefix(quiz.slug_base)}-` },
        createdBy: "seed_admin_jepangku",
      },
      select: { id: true, title: true, description: true, thumbnailUrl: true, slug: true },
    });
    if (!row) {
      console.log(`  skip: ${quiz.slug_base}`);
      continue;
    }

    const needsUpdate =
      row.title !== quiz.title ||
      row.description !== quiz.description ||
      row.thumbnailUrl !== quiz.thumbnailUrl;

    if (!needsUpdate) continue;

    console.log(`  update: ${quiz.slug_base} -> ${quiz.title}`);
    if (!DRY_RUN) {
      await prisma.quiz.update({
        where: { id: row.id },
        data: {
          title: quiz.title,
          description: quiz.description,
          thumbnailUrl: quiz.thumbnailUrl,
        },
      });
    }
    quizUpdates++;
  }

  console.log("\n=== Polls (slug_base) ===");
  for (const poll of polls) {
    const row = await prisma.poll.findFirst({
      where: {
        slug: { startsWith: `${slugPrefix(poll.slug_base)}-` },
        createdBy: "seed_admin_jepangku",
      },
      include: {
        questions: {
          include: { options: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!row) {
      console.log(`  skip: ${poll.slug_base}`);
      continue;
    }

    if (
      row.title !== poll.title ||
      row.description !== poll.description ||
      row.thumbnailUrl !== poll.thumbnailUrl
    ) {
      console.log(`  poll meta: ${poll.slug_base}`);
      if (!DRY_RUN) {
        await prisma.poll.update({
          where: { id: row.id },
          data: {
            title: poll.title,
            description: poll.description,
            thumbnailUrl: poll.thumbnailUrl,
          },
        });
      }
      pollMetaUpdates++;
    } else if (row.thumbnailUrl !== poll.thumbnailUrl) {
      pollThumbUpdates++;
    }

    for (const seedQ of poll.questions) {
      const dbQ = row.questions.find((q) => q.questionText === seedQ.questionText);
      if (!dbQ) continue;

      for (const seedOpt of seedQ.options) {
        if (!seedOpt.imageUrl) continue;
        const dbOpt = dbQ.options.find((o) => o.optionText === seedOpt.optionText);
        if (!dbOpt || dbOpt.imageUrl === seedOpt.imageUrl) continue;

        console.log(`    option: ${seedOpt.optionText} @ ${poll.slug_base}`);
        if (!DRY_RUN) {
          await prisma.pollOption.update({
            where: { id: dbOpt.id },
            data: { imageUrl: seedOpt.imageUrl },
          });
        }
        pollOptionUpdates++;
      }
    }
  }

  await prisma.$disconnect();

  console.log("\n=== Summary ===");
  console.log(`Articles: ${articleUpdates}`);
  console.log(`Quizzes: ${quizUpdates}`);
  console.log(`Poll meta: ${pollMetaUpdates}`);
  console.log(`Poll thumbnails: ${pollThumbUpdates}`);
  console.log(`Poll options: ${pollOptionUpdates}`);
  console.log(`Dry run: ${DRY_RUN}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
