import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../../common/http/api-response';
import { writeAudit } from '../../../common/helpers/audit.helper';
import { AppError } from '../../../common/errors/app-error';
import * as service from '../services/users.service';

function tenantIdFrom(req: Request) {
  const id = req.tenant?.id ?? req.user?.tenantId;
  if (!id) throw AppError.badRequest('Tenant context required');
  return id;
}

export async function list(req: Request, res: Response) {
  sendSuccess(res, await service.listUsers(tenantIdFrom(req)));
}

export async function create(req: Request, res: Response) {
  const tenantId = tenantIdFrom(req);
  const user = await service.createUser(tenantId, req.body);
  await writeAudit(req, {
    action: 'user.create',
    resource: 'User',
    resourceId: user.id,
    tenantId,
  });
  sendCreated(res, user);
}

export async function update(req: Request, res: Response) {
  const tenantId = tenantIdFrom(req);
  const user = await service.updateUser(tenantId, req.params.id, req.body);
  await writeAudit(req, {
    action: 'user.update',
    resource: 'User',
    resourceId: user.id,
    tenantId,
  });
  sendSuccess(res, user);
}
