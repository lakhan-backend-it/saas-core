import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error';
import { verifyAccessToken } from '../helpers/jwt.helper';

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return next(AppError.unauthorized());
  }

  try {
    const claims = verifyAccessToken(header.slice(7));
    req.user = {
      id: claims.sub,
      email: claims.email,
      isSuperAdmin: claims.isSuperAdmin,
      tenantId: claims.tenantId,
      membershipRole: claims.membershipRole,
    };
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired token'));
  }
};
