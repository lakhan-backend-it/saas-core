import type { MembershipRole } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { env } from '../../../config/env';
import { generateOpaqueToken, sha256 } from '../../../common/helpers/crypto.helper';
import {
  parseDurationToMs,
  signAccessToken,
  type AccessTokenClaims,
} from '../../../common/helpers/jwt.helper';

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
};

export async function issueTokenPair(input: {
  user: SessionUser;
  tenantId: string | null;
  membershipRole: MembershipRole | null;
}) {
  const claims: AccessTokenClaims = {
    sub: input.user.id,
    email: input.user.email,
    isSuperAdmin: input.user.isSuperAdmin,
    tenantId: input.tenantId,
    membershipRole: input.membershipRole,
  };

  const accessToken = signAccessToken(claims);
  const refreshToken = generateOpaqueToken();
  const tokenHash = sha256(refreshToken);
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: {
      userId: input.user.id,
      tokenHash,
      tenantId: input.tenantId,
      membershipRole: input.membershipRole,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer' as const,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  };
}

export async function rotateRefreshToken(rawRefreshToken: string) {
  const tokenHash = sha256(rawRefreshToken);
  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          isSuperAdmin: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!existing || existing.revokedAt || existing.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  if (!existing.user.isActive || existing.user.deletedAt) {
    return null;
  }

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  return {
    user: existing.user,
    tenantId: existing.tenantId,
    membershipRole: existing.membershipRole,
  };
}

export async function revokeRefreshToken(rawRefreshToken: string) {
  const tokenHash = sha256(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
