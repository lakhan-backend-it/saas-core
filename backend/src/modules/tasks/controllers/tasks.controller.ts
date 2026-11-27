import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../../common/http/api-response';
import { writeAudit } from '../../../common/helpers/audit.helper';
import { AppError } from '../../../common/errors/app-error';
import * as service from '../services/tasks.service';

function tid(req: Request) {
  if (!req.tenant) throw AppError.badRequest('Tenant context required');
  return req.tenant.id;
}

export async function list(req: Request, res: Response) {
  const projectId = typeof req.query.projectId === 'string' ? req.query.projectId : undefined;
  sendSuccess(res, await service.listTasks(tid(req), projectId));
}

export async function create(req: Request, res: Response) {
  const tenantId = tid(req);
  const task = await service.createTask(tenantId, req.body);
  await writeAudit(req, { action: 'task.create', resource: 'Task', resourceId: task.id, tenantId });
  sendCreated(res, task);
}

export async function update(req: Request, res: Response) {
  const tenantId = tid(req);
  const task = await service.updateTask(tenantId, req.params.id, req.body);
  await writeAudit(req, { action: 'task.update', resource: 'Task', resourceId: task.id, tenantId });
  sendSuccess(res, task);
}

export async function remove(req: Request, res: Response) {
  const tenantId = tid(req);
  const task = await service.deleteTask(tenantId, req.params.id);
  await writeAudit(req, { action: 'task.delete', resource: 'Task', resourceId: task.id, tenantId });
  sendSuccess(res, task);
}
