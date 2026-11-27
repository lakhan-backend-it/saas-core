import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';

export async function listSubscriptions() {
  return prisma.subscription.findMany({
    include: {
      tenant: { select: { id: true, name: true, slug: true } },
      plan: { select: { id: true, name: true, code: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function assignSubscription(input: {
  tenantId: string;
  planId: string;
  status?: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';
}) {
  const tenant = await prisma.tenant.findFirst({
    where: { id: input.tenantId, deletedAt: null },
  });
  if (!tenant) throw AppError.notFound('Tenant');

  const plan = await prisma.plan.findFirst({
    where: { id: input.planId, deletedAt: null, isActive: true },
  });
  if (!plan) throw AppError.notFound('Plan');

  return prisma.subscription.upsert({
    where: { tenantId: input.tenantId },
    create: {
      tenantId: input.tenantId,
      planId: input.planId,
      status: input.status ?? 'ACTIVE',
    },
    update: {
      planId: input.planId,
      status: input.status ?? 'ACTIVE',
    },
    include: {
      tenant: { select: { id: true, name: true, slug: true } },
      plan: { include: { planFeatures: { include: { feature: true } } } },
    },
  });
}
