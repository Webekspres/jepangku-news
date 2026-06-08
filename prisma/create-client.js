const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaPg } = require('@prisma/adapter-pg');

function isNeonDatabaseUrl(connectionString) {
  try {
    const host = new URL(connectionString.replace(/^postgres(ql)?:/, 'postgres:')).hostname;
    return host.endsWith('.neon.tech');
  } catch {
    return false;
  }
}

function createPrismaClient(connectionString = process.env.DATABASE_URL) {
  const adapter = isNeonDatabaseUrl(connectionString)
    ? new PrismaNeon({ connectionString })
    : new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

module.exports = { createPrismaClient };
