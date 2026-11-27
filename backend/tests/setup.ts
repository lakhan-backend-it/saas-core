import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for tests');
}

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS ?? '10';
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-min-32-characters!!';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-min-32-characters!';

// Warm Neon after scale-to-zero so the first login is less flaky.
import { beforeAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

beforeAll(async () => {
  const prisma = new PrismaClient();
  for (let i = 0; i < 5; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  await prisma.$disconnect().catch(() => undefined);
  throw new Error('Database unreachable for tests (Neon warm-up failed)');
}, 60_000);
