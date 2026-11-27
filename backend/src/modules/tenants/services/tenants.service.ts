import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';
import { slugify } from '../../../common/helpers/slug.helper';
import type { z } from 'zod';
import type { createTenantSchema, updateTenantSchema } from '../schemas/tenant.schema';

async function uniqueSlug(base: string) {
  let candidate = slugify(base) || 'tenant';
  let i = 0;
  while (await prisma.tenant.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    i += 1;
    candidate = `${slugify(base)}-${i}`;
  }
  return candidate;
}

export async function listTenants() {
  return prisma.tenant.findMany({
    where: { deletedAt: null },
    include: {
      subscription: { include: { plan: true } },
      _count: { select: { memberships: true, projects: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTenant(id: string) {
  const tenant = await prisma.tenant.findFirst({
    where: { id, deletedAt: null },
    include: {
      subscription: { include: { plan: { include: { planFeatures: { include: { feature: true } } } } } },
    },
  });
  if (!tenant) throw AppError.notFound('Tenant');
  return tenant;
}

export async function createTenant(input: z.infer<typeof createTenantSchema>) {
  const slug = input.slug ?? (await uniqueSlug(input.name));
  try {
    return await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: input.name,
          slug,
          customDomain: input.customDomain ?? null,
        },
      });
      if (input.planId) {
        await tx.subscription.create({
          data: { tenantId: tenant.id, planId: input.planId, status: 'ACTIVE' },
        });
      }
      return tx.tenant.findUniqueOrThrow({
        where: { id: tenant.id },
        include: { subscription: { include: { plan: true } } },
      });
    });
  } catch {
    throw AppError.conflict('Tenant slug or domain already exists');
  }
}

export async function updateTenant(id: string, input: z.infer<typeof updateTenantSchema>) {
  await getTenant(id);
  try {
    return await prisma.tenant.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        customDomain: input.customDomain,
        settings: input.settings as object | undefined,
        isActive: input.isActive,
      },
      include: { subscription: { include: { plan: true } } },
    });
  } catch {
    throw AppError.conflict('Tenant slug or domain already exists');
  }
}

export async function softDeleteTenant(id: string) {
  await getTenant(id);
  return prisma.tenant.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });
}
