import { prisma } from '../../lib/prisma';
import { AppError } from '../errors/app-error';

function currentPeriod() {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { periodStart, periodEnd };
}

export async function getUsage(tenantId: string, featureKey: string) {
  const { periodStart, periodEnd } = currentPeriod();
  const row = await prisma.usageRecord.findUnique({
    where: {
      tenantId_featureKey_periodStart: { tenantId, featureKey, periodStart },
    },
  });
  return { used: row?.used ?? 0, periodStart, periodEnd };
}

/**
 * Soft quota check for the current UTC month.
 * `limit == null` means unlimited. Pair with create + increment/sync in the same flow.
 */
export async function assertWithinLimit(
  tenantId: string,
  featureKey: string,
  limit: number | null | undefined
) {
  if (limit == null) return;
  const { used } = await getUsage(tenantId, featureKey);
  if (used >= limit) {
    throw new AppError(`Plan limit reached for "${featureKey}" (${limit})`, {
      statusCode: 403,
      code: 'FEATURE_DISABLED',
      details: { feature: featureKey, limit, used },
    });
  }
}

export async function incrementUsage(tenantId: string, featureKey: string, by = 1) {
  const { periodStart, periodEnd } = currentPeriod();
  await prisma.usageRecord.upsert({
    where: {
      tenantId_featureKey_periodStart: { tenantId, featureKey, periodStart },
    },
    create: { tenantId, featureKey, used: by, periodStart, periodEnd },
    update: { used: { increment: by } },
  });
}

export async function syncUsageCount(tenantId: string, featureKey: string, used: number) {
  const { periodStart, periodEnd } = currentPeriod();
  await prisma.usageRecord.upsert({
    where: {
      tenantId_featureKey_periodStart: { tenantId, featureKey, periodStart },
    },
    create: { tenantId, featureKey, used, periodStart, periodEnd },
    update: { used },
  });
}
