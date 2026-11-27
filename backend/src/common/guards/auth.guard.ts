import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../errors/app-error';
import type { AuthUser } from '../types/express';
import type { MembershipRole } from '@prisma/client';

type AccessTokenPayload = {
  sub: string;
  email: string;
  isSuperAdmin: boolean;
  tenantId: string | null;
  membershipRole: MembershipRole | null;
};

/** Prefer migrating call sites to `common/middleware/authenticate.ts`. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return next(AppError.unauthorized());
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    const user: AuthUser = {
      id: payload.sub,
      email: payload.email,
      isSuperAdmin: payload.isSuperAdmin,
      tenantId: payload.tenantId,
      membershipRole: payload.membershipRole,
    };
    req.user = user;
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired token'));
  }
};
