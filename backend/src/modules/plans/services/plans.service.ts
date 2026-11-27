import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';
import type { z } from 'zod';
import type { createPlanSchema, setPlanFeaturesSchema, updatePlanSchema } from '../schemas/plan.schema';

export async function listPlans() {
  return prisma.plan.findMany({
    where: { deletedAt: null },
    include: {
      planFeatures: { include: { feature: true } },
      _count: { select: { subscriptions: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getPlan(id: string) {
  const plan = await prisma.plan.findFirst({
    where: { id, deletedAt: null },
    include: { planFeatures: { include: { feature: true } } },
  });
  if (!plan) throw AppError.notFound('Plan');
  return plan;
}

export async function createPlan(input: z.infer<typeof createPlanSchema>) {
  try {
    return await prisma.plan.create({ data: input });
  } catch {
    throw AppError.conflict('Plan name or code already exists');
  }
}

export async function updatePlan(id: string, input: z.infer<typeof updatePlanSchema>) {
  await getPlan(id);
  try {
    return await prisma.plan.update({ where: { id }, data: input });
  } catch {
    throw AppError.conflict('Plan name or code already exists');
  }
}

export async function softDeletePlan(id: string) {
  await getPlan(id);
  return prisma.plan.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });
}

export async function setPlanFeatures(
  planId: string,
  input: z.infer<typeof setPlanFeaturesSchema>
) {
  await getPlan(planId);
  await prisma.$transaction(
    input.features.map((f) =>
      prisma.planFeature.upsert({
        where: { planId_featureId: { planId, featureId: f.featureId } },
        create: {
          planId,
          featureId: f.featureId,
          enabled: f.enabled,
          limit: f.limit ?? null,
        },
        update: { enabled: f.enabled, limit: f.limit ?? null },
      })
    )
  );
  return getPlan(planId);
}
