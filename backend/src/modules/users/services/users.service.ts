import { MembershipRole } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';
import { hashPassword } from '../../../common/helpers/password.helper';

export async function listUsers(tenantId: string) {
  const memberships = await prisma.tenantMembership.findMany({
    where: { tenantId, isActive: true },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
  return memberships.map((m) => ({
    membershipId: m.id,
    role: m.role,
    ...m.user,
  }));
}

export async function createUser(
  tenantId: string,
  input: {
    email: string;
    fullName: string;
    password: string;
    role: 'TENANT_ADMIN' | 'TENANT_USER';
  }
) {
  const passwordHash = await hashPassword(input.password);
  return prisma.$transaction(async (tx) => {
    let user = await tx.user.findUnique({ where: { email: input.email } });
    if (!user) {
      user = await tx.user.create({
        data: {
          email: input.email,
          fullName: input.fullName,
          passwordHash,
        },
      });
    } else if (!user.isActive || user.deletedAt) {
      throw AppError.conflict('User exists but is inactive');
    }

    const existing = await tx.tenantMembership.findUnique({
      where: { userId_tenantId: { userId: user.id, tenantId } },
    });
    if (existing?.isActive) throw AppError.conflict('User already in this tenant');

    const membership = await tx.tenantMembership.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId } },
      create: {
        userId: user.id,
        tenantId,
        role: input.role as MembershipRole,
        isDefault: false,
      },
      update: {
        role: input.role as MembershipRole,
        isActive: true,
      },
    });

    return {
      membershipId: membership.id,
      role: membership.role,
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
    };
  });
}

export async function updateUser(
  tenantId: string,
  userId: string,
  input: { fullName?: string; role?: 'TENANT_ADMIN' | 'TENANT_USER'; isActive?: boolean }
) {
  const membership = await prisma.tenantMembership.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
  });
  if (!membership) throw AppError.notFound('User');

  const [user, mem] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        fullName: input.fullName,
        isActive: input.isActive,
      },
      select: { id: true, email: true, fullName: true, isActive: true },
    }),
    prisma.tenantMembership.update({
      where: { userId_tenantId: { userId, tenantId } },
      data: {
        role: input.role as MembershipRole | undefined,
        isActive: input.isActive,
      },
    }),
  ]);

  return { membershipId: mem.id, role: mem.role, ...user };
}
