import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';

function isNeonDatabaseUrl(connectionString: string): boolean {
  try {
    const host = new URL(connectionString.replace(/^postgres(ql)?:/, 'postgres:')).hostname;
    return host.endsWith('.neon.tech');
  } catch {
    return false;
  }
}

export function createPrismaClient(connectionString = process.env.DATABASE_URL!): PrismaClient {
  const adapter = isNeonDatabaseUrl(connectionString)
    ? new PrismaNeon({ connectionString })
    : new PrismaPg({ connectionString });

  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}
