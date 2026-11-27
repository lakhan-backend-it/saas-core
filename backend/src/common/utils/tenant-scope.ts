import { AppError } from '../errors/app-error';

/**
 * Always pass tenantId from trusted context (req.tenant), never from body.
 * Use this helper in every repository/service query builder.
 */
export function tenantWhere(tenantId: string | undefined) {
  if (!tenantId) {
    throw new AppError('Tenant context required', {
      statusCode: 400,
      code: 'TENANT_REQUIRED',
    });
  }
  return { tenantId };
}

/** Prevent IDOR: ensure loaded row belongs to current tenant. */
export function assertTenantOwnership(
  rowTenantId: string,
  currentTenantId: string,
  resource = 'Resource'
) {
  if (rowTenantId !== currentTenantId) {
    throw AppError.notFound(resource);
  }
}
