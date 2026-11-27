import type { RequestHandler } from 'express';
import type { MembershipRole } from '@prisma/client';
import { AppError } from '../errors/app-error';

type Allowed =
  | { superAdmin?: true; roles?: MembershipRole[] }
  | MembershipRole[];

/** Prefer `common/middleware/require-roles.ts` when renaming folders. */
export function requireRoles(allowed: Allowed): RequestHandler {
  const opts = Array.isArray(allowed)
    ? { roles: allowed as MembershipRole[], superAdmin: false }
    : { superAdmin: !!allowed.superAdmin, roles: allowed.roles ?? [] };

  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());

    if (opts.superAdmin && req.user.isSuperAdmin) return next();

    if (
      req.user.membershipRole &&
      opts.roles.includes(req.user.membershipRole)
    ) {
      return next();
    }

    if (req.user.isSuperAdmin && opts.roles.length === 0 && opts.superAdmin) {
      return next();
    }

    return next(AppError.forbidden());
  };
}
