import jwt, { type SignOptions } from 'jsonwebtoken';
import type { MembershipRole } from '@prisma/client';
import { env } from '../../config/env';

export type AccessTokenClaims = {
  sub: string;
  email: string;
  isSuperAdmin: boolean;
  tenantId: string | null;
  membershipRole: MembershipRole | null;
};

export function signAccessToken(claims: AccessTokenClaims): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(claims, env.JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenClaims;
}

export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)([smhd])$/i.exec(duration.trim());
  if (!match) {
    // fallback 7d
    return 7 * 24 * 60 * 60 * 1000;
  }
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const mult =
    unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
  return amount * mult;
}
