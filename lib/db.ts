import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL!;
  const sql = neon(connectionString);
  const adapter = new PrismaNeon(sql);
  // @ts-expect-error - adapter is supported in Prisma 6 with driverAdapters
  return new PrismaClient({ adapter });
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
