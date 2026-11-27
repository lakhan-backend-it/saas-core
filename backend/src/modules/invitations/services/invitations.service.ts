import { MembershipRole } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';
import { generateOpaqueToken, sha256 } from '../../../common/helpers/crypto.helper';
import { hashPassword } from '../../../common/helpers/password.helper';
import { env } from '../../../config/env';
import { logger } from '../../../lib/logger';

export async function listInvitations(tenantId: string) {
  return prisma.invitation.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createInvitation(input: {
  tenantId: string;
  email: string;
  role: 'TENANT_ADMIN' | 'TENANT_USER';
  invitedById?: string;
}) {
  const token = generateOpaqueToken();
  const invitation = await prisma.invitation.create({
    data: {
      tenantId: input.tenantId,
      email: input.email.toLowerCase(),
      role: input.role as MembershipRole,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      invitedById: input.invitedById,
    },
  });

  const acceptUrl = `${env.APP_URL}/accept-invite?token=${token}`;
  logger.info({ acceptUrl, email: input.email }, 'Invitation created (email adapter optional)');

  return { invitation, acceptUrl, token };
}

export async function acceptInvitation(input: {
  token: string;
  fullName: string;
  password: string;
}) {
  const tokenHash = sha256(input.token);
  const invitation = await prisma.invitation.findUnique({ where: { tokenHash } });
  if (!invitation || invitation.status !== 'PENDING') {
    throw AppError.badRequest('Invalid invitation');
  }
  if (invitation.expiresAt.getTime() < Date.now()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'EXPIRED' },
    });
    throw AppError.badRequest('Invitation expired');
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    let user = await tx.user.findUnique({ where: { email: invitation.email } });
    if (!user) {
      user = await tx.user.create({
        data: {
          email: invitation.email,
          fullName: input.fullName,
          passwordHash,
        },
      });
    }

    await tx.tenantMembership.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId: invitation.tenantId } },
      create: {
        userId: user.id,
        tenantId: invitation.tenantId,
        role: invitation.role,
        isDefault: true,
      },
      update: { role: invitation.role, isActive: true },
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });

    await tx.notification.create({
      data: {
        userId: user.id,
        tenantId: invitation.tenantId,
        title: 'Welcome',
        body: 'You joined the workspace via invitation.',
      },
    });

    return { userId: user.id, tenantId: invitation.tenantId, email: user.email };
  });
}
