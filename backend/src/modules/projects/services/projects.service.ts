import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';
import { FEATURES } from '../../../common/constants/features';
import {
  assertWithinLimit,
  syncUsageCount,
} from '../../../common/helpers/usage.helper';

export async function listProjects(tenantId: string) {
  return prisma.project.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createProject(
  tenantId: string,
  input: { name: string; description?: string },
  limit: number | null | undefined
) {
  await assertWithinLimit(tenantId, FEATURES.PROJECTS, limit);
  const project = await prisma.project.create({
    data: { tenantId, name: input.name, description: input.description },
  });
  const count = await prisma.project.count({ where: { tenantId, deletedAt: null } });
  await syncUsageCount(tenantId, FEATURES.PROJECTS, count);
  return project;
}

export async function updateProject(
  tenantId: string,
  id: string,
  input: { name?: string; description?: string; isActive?: boolean }
) {
  const existing = await prisma.project.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
  if (!existing) throw AppError.notFound('Project');
  return prisma.project.update({ where: { id }, data: input });
}

export async function deleteProject(tenantId: string, id: string) {
  const existing = await prisma.project.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
  if (!existing) throw AppError.notFound('Project');
  const project = await prisma.project.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
  const count = await prisma.project.count({ where: { tenantId, deletedAt: null } });
  await syncUsageCount(tenantId, FEATURES.PROJECTS, count);
  return project;
}
