import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../../common/http/api-response';
import { writeAudit } from '../../../common/helpers/audit.helper';
import { AppError } from '../../../common/errors/app-error';
import * as service from '../services/tenants.service';

export async function list(req: Request, res: Response) {
  if (!req.user?.isSuperAdmin) throw AppError.forbidden();
  sendSuccess(res, await service.listTenants());
}

export async function get(req: Request, res: Response) {
  const id = req.params.id;
  if (!req.user?.isSuperAdmin && req.user?.tenantId !== id) throw AppError.forbidden();
  sendSuccess(res, await service.getTenant(id));
}

export async function create(req: Request, res: Response) {
  const tenant = await service.createTenant(req.body);
  await writeAudit(req, {
    action: 'tenant.create',
    resource: 'Tenant',
    resourceId: tenant.id,
    tenantId: tenant.id,
  });
  sendCreated(res, tenant);
}

export async function update(req: Request, res: Response) {
  const id = req.params.id;
  const isTenantAdmin =
    !req.user?.isSuperAdmin &&
    req.user?.tenantId === id &&
    req.user.membershipRole === 'TENANT_ADMIN';

  if (!req.user?.isSuperAdmin && !isTenantAdmin) throw AppError.forbidden();

  // Tenant admin cannot flip isActive via this path arbitrarily from platform fields
  const body = req.user?.isSuperAdmin
    ? req.body
    : { name: req.body.name, settings: req.body.settings, customDomain: req.body.customDomain };

  const tenant = await service.updateTenant(id, body);
  await writeAudit(req, {
    action: 'tenant.update',
    resource: 'Tenant',
    resourceId: tenant.id,
    tenantId: tenant.id,
  });
  sendSuccess(res, tenant);
}

export async function remove(req: Request, res: Response) {
  if (!req.user?.isSuperAdmin) throw AppError.forbidden();
  const tenant = await service.softDeleteTenant(req.params.id);
  await writeAudit(req, {
    action: 'tenant.delete',
    resource: 'Tenant',
    resourceId: tenant.id,
    tenantId: tenant.id,
  });
  sendSuccess(res, tenant);
}
