/**
 * Purge expired portal notifications (retention default 90 days).
 *
 * Usage:
 *   bun run purge:notifications           # dry-run count
 *   bun run purge:notifications -- --apply
 */
import 'dotenv/config';
import { createPrismaClient } from '../prisma/create-client.js';
import { purgeExpiredNotifications } from '../lib/notifications/retention.js';

const prisma = createPrismaClient();
const apply = process.argv.includes('--apply');

async function main() {
  const now = new Date();

  if (!apply) {
    const fallbackCutoff = new Date(now);
    fallbackCutoff.setDate(fallbackCutoff.getDate() - 90);

    const count = await prisma.notification.count({
      where: {
        OR: [
          { expiresAt: { lte: now } },
          { expiresAt: null, createdAt: { lte: fallbackCutoff } },
        ],
      },
    });

    console.log(`[dry-run] ${count} notification(s) eligible for purge`);
    console.log('Re-run with --apply to delete.');
    return;
  }

  const { deleted } = await purgeExpiredNotifications(now);
  console.log(`Deleted ${deleted} expired notification(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
