/**
 * Remove portal users whose id is not a Clerk User ID (pre-cutover JWT/UUID/seed rows).
 *
 * Usage:
 *   bun run purge:legacy-users              # dry-run (default)
 *   bun run purge:legacy-users -- --delete  # delete legacy rows
 *   bun run purge:legacy-users -- --delete --keep-seed  # keep seed_* for local dev content
 */
import "dotenv/config";
import { createPrismaClient } from "../prisma/create-client.js";
import { isLegacyPortalUserId } from "../lib/auth/clerk-id";

const prisma = createPrismaClient();

const args = new Set(process.argv.slice(2));
const dryRun = !args.has("--delete");
const keepSeed = args.has("--keep-seed");

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      _count: {
        select: {
          articles: true,
          comments: true,
          pointTransactions: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const legacy = users.filter((u) => {
    if (!isLegacyPortalUserId(u.id)) return false;
    if (keepSeed && u.id.startsWith("seed_")) return false;
    return true;
  });

  if (legacy.length === 0) {
    console.log("No legacy portal users to purge.");
    return;
  }

  console.log(
    `${dryRun ? "[DRY RUN] " : ""}Found ${legacy.length} legacy user(s):`,
  );
  for (const u of legacy) {
    console.log(
      `  - ${u.id} | ${u.email} | @${u.username} | articles=${u._count.articles} comments=${u._count.comments} points=${u._count.pointTransactions}`,
    );
  }

  if (dryRun) {
    console.log("\nRe-run with --delete to remove (CASCADE deletes related rows).");
    console.log("Use --keep-seed to retain seed_* dev authors.");
    return;
  }

  const ids = legacy.map((u) => u.id);
  const result = await prisma.user.deleteMany({ where: { id: { in: ids } } });
  console.log(`\nDeleted ${result.count} legacy user(s).`);
  console.log("Remaining users must sign in via Clerk (/sign-in).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
