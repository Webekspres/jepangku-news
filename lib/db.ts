import { PrismaClient } from '@prisma/client';
import { createPrismaClient as buildPrismaClient } from '@/lib/create-prisma-client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db: PrismaClient =
  globalForPrisma.prisma ?? buildPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
