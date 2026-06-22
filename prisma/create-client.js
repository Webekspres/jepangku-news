const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

function createPrismaClient(connectionString = process.env.DATABASE_URL) {
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

module.exports = { createPrismaClient };
