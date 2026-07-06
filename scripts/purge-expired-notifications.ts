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
import { logger } from '../lib/logger';

const log = logger.child({ module: 'scripts.purge-notifications' });
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

    log.info('purge.notifications.dry_run', { eligibleCount: count });
    return;
  }

  const { deleted } = await purgeExpiredNotifications(now);
  log.info('purge.notifications.completed', { deleted });
}

main()
  .catch((error) => {
    log.error('purge.notifications.failed', {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
