import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from '@/lib/logger';

const SLOW_QUERY_THRESHOLD_MS = 1_000;

export function createPrismaClient(connectionString = process.env.DATABASE_URL!): PrismaClient {
  const adapter = new PrismaPg({ connectionString });

  const client = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  // ── Prisma $extends: log slow queries (>1s) ─────────────────────
  // Note: $extends returns a NEW client — the original is untouched
  return client.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        const start = Date.now();
        const result = await query(args);
        const durationMs = Date.now() - start;

        if (durationMs > SLOW_QUERY_THRESHOLD_MS) {
          logger.warn('db.slow_query', {
            model,
            action: operation,
            durationMs,
          });
        }

        return result;
      },
    },
  }) as PrismaClient;
}
