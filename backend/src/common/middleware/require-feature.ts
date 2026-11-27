import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error';

export function requireFeature(featureKey: string): RequestHandler {
  return (req, _res, next) => {
    if (req.user?.isSuperAdmin) return next();
    if (!req.tenant) {
      return next(
        new AppError('Tenant context required', { statusCode: 400, code: 'TENANT_REQUIRED' })
      );
    }
    if (!req.tenant.features.includes(featureKey)) {
      return next(AppError.featureDisabled(featureKey));
    }
    next();
  };
}
