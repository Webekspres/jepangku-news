import { Prisma } from '@prisma/client';

export function prismaUniqueViolation(message = 'Unique constraint failed'): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError(message, {
    code: 'P2002',
    clientVersion: 'test',
  });
}
