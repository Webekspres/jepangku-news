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
import { logger } from "../lib/logger";

const log = logger.child({ module: 'scripts.purge-legacy-users' });
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
    log.info('purge.legacy-users.dry_run', { eligibleCount: 0 });
    return;
  }

  log.info('purge.legacy-users.preview', {
    dryRun,
    keepSeed,
    eligibleCount: legacy.length,
    users: legacy.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      role: u.role,
      articleCount: u._count.articles,
      commentCount: u._count.comments,
      pointCount: u._count.pointTransactions,
    })),
  });

  if (dryRun) {
    return;
  }

  const ids = legacy.map((u) => u.id);
  const result = await prisma.user.deleteMany({ where: { id: { in: ids } } });
  log.info('purge.legacy-users.completed', { deletedCount: result.count });
}

main()
  .catch((error) => {
    log.error('purge.legacy-users.failed', {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
