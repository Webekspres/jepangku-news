/**
 * Backfill HTML/text sanitization on user-generated content written before sanitizers shipped.
 *
 * Usage:
 *   bun run backfill:sanitize                    # dry-run all tables
 *   bun run backfill:sanitize -- --apply         # write changes
 *   bun run backfill:sanitize -- --table=comments
 *   bun run backfill:sanitize -- --limit=50 --apply
 */
import "dotenv/config";
import { createPrismaClient } from "../prisma/create-client.js";
import {
  BACKFILL_SPECS,
  BACKFILL_TABLES,
  sanitizeRowFields,
  type BackfillTable,
} from "../lib/content-sanitize-backfill.js";

const prisma = createPrismaClient();

const BATCH_SIZE = 100;
const TX_CHUNK = 25;

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const limitArg = args.find((a) => a.startsWith("--limit="));
const tableArg = args.find((a) => a.startsWith("--table="));
const maxRows = limitArg ? Number(limitArg.split("=")[1]) : undefined;
const onlyTable = tableArg ? (tableArg.split("=")[1] as BackfillTable) : undefined;

if (onlyTable && !BACKFILL_TABLES.includes(onlyTable)) {
  console.error(`Unknown table: ${onlyTable}. Valid: ${BACKFILL_TABLES.join(", ")}`);
  process.exit(1);
}

type Row = { id: string } & Record<string, unknown>;

async function processTable(table: BackfillTable) {
  const spec = BACKFILL_SPECS[table];

  const selectKeys = new Set<string>(["id"]);
  for (const f of spec.stringFields) selectKeys.add(f.key);
  for (const f of spec.urlFields ?? []) selectKeys.add(f.key);

  const select = Object.fromEntries([...selectKeys].map((k) => [k, true]));

  let cursor: string | undefined;
  let scanned = 0;
  let changed = 0;
  let updated = 0;

  while (true) {
    if (maxRows !== undefined && scanned >= maxRows) break;

    const take = maxRows !== undefined ? Math.min(BATCH_SIZE, maxRows - scanned) : BATCH_SIZE;
    const pageArgs = {
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" as const },
      select,
    };

    const rows = (await fetchRows(table, pageArgs)) as Row[];

    if (rows.length === 0) break;
    cursor = rows[rows.length - 1]!.id;
    scanned += rows.length;

    const pending: { id: string; data: Record<string, string | null> }[] = [];

    for (const row of rows) {
      const { changed: rowChanged, data } = sanitizeRowFields(
        row,
        spec.stringFields,
        spec.urlFields,
      );
      if (!rowChanged) continue;
      changed += 1;
      pending.push({ id: row.id, data });
    }

    if (pending.length === 0) continue;

    if (!apply) {
      for (const item of pending.slice(0, 5)) {
        console.log(`  [would update] ${table} id=${item.id}`);
      }
      if (pending.length > 5) {
        console.log(`  ... and ${pending.length - 5} more in this batch`);
      }
      continue;
    }

    for (let i = 0; i < pending.length; i += TX_CHUNK) {
      const chunk = pending.slice(i, i + TX_CHUNK);
      await prisma.$transaction(
        chunk.map((item) => updateRow(table, item.id, item.data)),
      );
      updated += chunk.length;
    }
  }

  return { scanned, changed, updated };
}

type PageArgs = {
  take: number;
  skip?: number;
  cursor?: { id: string };
  orderBy: { id: "asc" };
  select: Record<string, boolean>;
};

async function fetchRows(table: BackfillTable, args: PageArgs) {
  switch (table) {
    case "articles":
      return prisma.article.findMany(args);
    case "article_revisions":
      return prisma.articleRevision.findMany(args);
    case "comments":
      return prisma.comment.findMany(args);
    case "info_pages":
      return prisma.infoPage.findMany(args);
    case "quizzes":
      return prisma.quiz.findMany(args);
    case "quiz_questions":
      return prisma.quizQuestion.findMany(args);
    case "quiz_options":
      return prisma.quizOption.findMany(args);
    case "polls":
      return prisma.poll.findMany(args);
    case "poll_questions":
      return prisma.pollQuestion.findMany(args);
    case "poll_options":
      return prisma.pollOption.findMany(args);
    case "user_profiles":
      return prisma.userProfile.findMany(args);
    case "users":
      return prisma.user.findMany(args);
    case "videos":
      return prisma.video.findMany(args);
    case "ad_slots":
      return prisma.adSlot.findMany(args);
    default:
      throw new Error(`Unknown table: ${table satisfies never}`);
  }
}

function updateRow(table: BackfillTable, id: string, data: Record<string, string | null>) {
  switch (table) {
    case "articles":
      return prisma.article.update({ where: { id }, data });
    case "article_revisions":
      return prisma.articleRevision.update({ where: { id }, data });
    case "comments":
      return prisma.comment.update({ where: { id }, data });
    case "info_pages":
      return prisma.infoPage.update({ where: { id }, data });
    case "quizzes":
      return prisma.quiz.update({ where: { id }, data });
    case "quiz_questions":
      return prisma.quizQuestion.update({ where: { id }, data });
    case "quiz_options":
      return prisma.quizOption.update({ where: { id }, data });
    case "polls":
      return prisma.poll.update({ where: { id }, data });
    case "poll_questions":
      return prisma.pollQuestion.update({ where: { id }, data });
    case "poll_options":
      return prisma.pollOption.update({ where: { id }, data });
    case "user_profiles":
      return prisma.userProfile.update({ where: { id }, data });
    case "users":
      return prisma.user.update({ where: { id }, data });
    case "videos":
      return prisma.video.update({ where: { id }, data });
    case "ad_slots":
      return prisma.adSlot.update({ where: { id }, data });
    default:
      throw new Error(`Unknown table: ${table satisfies never}`);
  }
}

async function main() {
  const tables = onlyTable ? [onlyTable] : BACKFILL_TABLES;
  console.log(`${apply ? "APPLY" : "DRY RUN"} — sanitasi konten (${tables.join(", ")})`);

  let totalScanned = 0;
  let totalChanged = 0;
  let totalUpdated = 0;

  for (const table of tables) {
    const result = await processTable(table);
    totalScanned += result.scanned;
    totalChanged += result.changed;
    totalUpdated += result.updated;
    console.log(
      `${table}: scanned=${result.scanned} changed=${result.changed}${apply ? ` updated=${result.updated}` : ""}`,
    );
  }

  console.log(
    `\nTotal: scanned=${totalScanned} changed=${totalChanged}${apply ? ` updated=${totalUpdated}` : ""}`,
  );

  if (!apply && totalChanged > 0) {
    console.log("\nRe-run with --apply to persist changes.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
