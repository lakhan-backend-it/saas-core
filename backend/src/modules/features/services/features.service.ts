import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';
import type { z } from 'zod';
import type { createFeatureSchema, updateFeatureSchema } from '../schemas/feature.schema';

export async function listFeatures() {
  return prisma.feature.findMany({ orderBy: { key: 'asc' } });
}

export async function createFeature(input: z.infer<typeof createFeatureSchema>) {
  try {
    return await prisma.feature.create({ data: input });
  } catch {
    throw AppError.conflict('Feature key already exists');
  }
}

export async function updateFeature(id: string, input: z.infer<typeof updateFeatureSchema>) {
  const existing = await prisma.feature.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Feature');
  try {
    return await prisma.feature.update({ where: { id }, data: input });
  } catch {
    throw AppError.conflict('Feature key already exists');
  }
}
