import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';

export async function listTasks(tenantId: string, projectId?: string) {
  return prisma.task.findMany({
    where: {
      tenantId,
      deletedAt: null,
      ...(projectId ? { projectId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createTask(
  tenantId: string,
  input: { projectId: string; title: string; description?: string }
) {
  const project = await prisma.project.findFirst({
    where: { id: input.projectId, tenantId, deletedAt: null },
  });
  if (!project) throw AppError.notFound('Project');

  return prisma.task.create({
    data: {
      tenantId,
      projectId: input.projectId,
      title: input.title,
      description: input.description,
    },
  });
}

export async function updateTask(
  tenantId: string,
  id: string,
  input: { title?: string; description?: string; isDone?: boolean; isActive?: boolean }
) {
  const existing = await prisma.task.findFirst({ where: { id, tenantId, deletedAt: null } });
  if (!existing) throw AppError.notFound('Task');
  return prisma.task.update({ where: { id }, data: input });
}

export async function deleteTask(tenantId: string, id: string) {
  const existing = await prisma.task.findFirst({ where: { id, tenantId, deletedAt: null } });
  if (!existing) throw AppError.notFound('Task');
  return prisma.task.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
}
