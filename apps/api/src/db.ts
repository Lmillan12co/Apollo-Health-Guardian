import { PrismaClient } from '@prisma/client';

// Single shared Prisma client. The schema lives at apps/api/prisma/schema.prisma
// and the client is generated with:
//   pnpm --filter @apollo/api prisma:generate
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
