import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaNeonHTTP(connectionString, {});
  return new PrismaClient({ adapter } as ConstructorParameters<
    typeof PrismaClient
  >[0]);
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
