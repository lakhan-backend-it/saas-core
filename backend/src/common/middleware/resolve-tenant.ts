import type { RequestHandler } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../errors/app-error';

/**
 * Resolve active tenant + plan features/limits onto `req.tenant`.
 * Tenant id is taken from the JWT (trusted). `X-Tenant-ID` may only match —
 * never override — so clients cannot spoof into another workspace.
 */
export const resolveTenant: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.user) return next(AppError.unauthorized());

    // Super Admin without workspace may optionally target a tenant via header.
    if (req.user.isSuperAdmin && !req.user.tenantId) {
      const headerTenant = req.header('x-tenant-id');
      if (!headerTenant) return next();
      const tenant = await loadTenantWithFeatures(headerTenant);
      if (!tenant) return next(AppError.notFound('Tenant'));
      req.tenant = tenant;
      return next();
    }

    const tenantId = req.user.tenantId;
    if (!tenantId) {
      return next(
        new AppError('Tenant context required', { statusCode: 400, code: 'TENANT_REQUIRED' })
      );
    }

    const spoofed = req.header('x-tenant-id');
    if (spoofed && spoofed !== tenantId) {
      return next(AppError.forbidden('Tenant mismatch'));
    }

    const tenant = await loadTenantWithFeatures(tenantId);
    if (!tenant) return next(AppError.notFound('Tenant'));
    req.tenant = tenant;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireTenant: RequestHandler = (req, _res, next) => {
  if (!req.tenant) {
    return next(
      new AppError('Tenant context required', { statusCode: 400, code: 'TENANT_REQUIRED' })
    );
  }
  next();
};

async function loadTenantWithFeatures(tenantIdOrSlug: string) {
  const tenant = await prisma.tenant.findFirst({
    where: {
      deletedAt: null,
      isActive: true,
      OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }, { customDomain: tenantIdOrSlug }],
    },
    include: {
      subscription: {
        include: {
          plan: {
            include: {
              planFeatures: {
                where: { enabled: true },
                include: { feature: true },
              },
            },
          },
        },
      },
    },
  });

  if (!tenant) return null;

  const limits: Record<string, number | null> = {};
  const features =
    tenant.subscription?.plan.planFeatures.map((pf) => {
      limits[pf.feature.key] = pf.limit;
      return pf.feature.key;
    }) ?? [];

  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    customDomain: tenant.customDomain,
    planId: tenant.subscription?.planId ?? null,
    features,
    limits,
  };
}
