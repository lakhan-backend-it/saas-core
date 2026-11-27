import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../../common/http/api-response';
import { writeAudit } from '../../../common/helpers/audit.helper';
import { AppError } from '../../../common/errors/app-error';
import { FEATURES } from '../../../common/constants/features';
import * as service from '../services/projects.service';

function tid(req: Request) {
  if (!req.tenant) throw AppError.badRequest('Tenant context required');
  return req.tenant.id;
}

export async function list(req: Request, res: Response) {
  sendSuccess(res, await service.listProjects(tid(req)));
}

export async function create(req: Request, res: Response) {
  const tenantId = tid(req);
  const project = await service.createProject(
    tenantId,
    req.body,
    req.tenant!.limits[FEATURES.PROJECTS]
  );
  await writeAudit(req, {
    action: 'project.create',
    resource: 'Project',
    resourceId: project.id,
    tenantId,
  });
  sendCreated(res, project);
}

export async function update(req: Request, res: Response) {
  const tenantId = tid(req);
  const project = await service.updateProject(tenantId, req.params.id, req.body);
  await writeAudit(req, {
    action: 'project.update',
    resource: 'Project',
    resourceId: project.id,
    tenantId,
  });
  sendSuccess(res, project);
}

export async function remove(req: Request, res: Response) {
  const tenantId = tid(req);
  const project = await service.deleteProject(tenantId, req.params.id);
  await writeAudit(req, {
    action: 'project.delete',
    resource: 'Project',
    resourceId: project.id,
    tenantId,
  });
  sendSuccess(res, project);
}
