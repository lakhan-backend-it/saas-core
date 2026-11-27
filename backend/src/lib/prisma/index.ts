import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env';
import { logger } from '../logger';

/**
 * Single Prisma client instance with query logging in non-prod.
 * Avoid instantiating PrismaClient per request (connection exhaustion).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
  });

if (env.NODE_ENV === 'development') {
  // @ts-expect-error Prisma event typing varies by generated client
  prisma.$on('query', (e: { query: string; duration: number }) => {
    if (e.duration > 200) {
      logger.warn({ durationMs: e.duration, query: e.query }, 'Slow query');
    }
  });
}

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
