import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export function createPrismaClient(connectionString = process.env.DATABASE_URL!): PrismaClient {
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}
