import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error';

/** Prefer `common/middleware/require-feature.ts`. */
export function requireFeature(featureKey: string): RequestHandler {
  return (req, _res, next) => {
    if (req.user?.isSuperAdmin) return next();
    if (!req.tenant) {
      return next(
        new AppError('Tenant context required', {
          statusCode: 400,
          code: 'TENANT_REQUIRED',
        })
      );
    }
    if (!req.tenant.features.includes(featureKey)) {
      return next(AppError.featureDisabled(featureKey));
    }
    next();
  };
}

/** Enforce plan limit (e.g. Free = 5 projects). Pair with usage service. */
export function requireLimit(featureKey: string): RequestHandler {
  return (req, _res, next) => {
    if (req.user?.isSuperAdmin) return next();
    if (!req.tenant) {
      return next(
        new AppError('Tenant context required', {
          statusCode: 400,
          code: 'TENANT_REQUIRED',
        })
      );
    }
    const limit = req.tenant.limits[featureKey];
    if (limit == null) return next(); // unlimited or not configured
    const used = Number(req.headers['x-usage-hint'] ?? NaN);
    // Real check happens in service via UsageRecord; middleware only documents contract.
    if (!Number.isNaN(used) && used >= limit) {
      return next(
        new AppError(`Plan limit reached for "${featureKey}" (${limit})`, {
          statusCode: 403,
          code: 'FEATURE_DISABLED',
          details: { feature: featureKey, limit, used },
        })
      );
    }
    next();
  };
}
