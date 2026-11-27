import type { RequestHandler } from 'express';
import type { MembershipRole } from '@prisma/client';
import { AppError } from '../errors/app-error';

type RequireRolesOptions = {
  /** Allow platform Super Admin */
  superAdmin?: boolean;
  /** Allowed tenant membership roles */
  roles?: MembershipRole[];
};

export function requireRoles(options: RequireRolesOptions): RequestHandler {
  const { superAdmin = false, roles = [] } = options;

  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());

    if (superAdmin && req.user.isSuperAdmin) return next();

    if (req.user.membershipRole && roles.includes(req.user.membershipRole)) {
      return next();
    }

    return next(AppError.forbidden());
  };
}
