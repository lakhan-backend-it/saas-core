import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../../common/http/api-response';
import { writeAudit } from '../../../common/helpers/audit.helper';
import * as service from '../services/plans.service';

export async function list(req: Request, res: Response) {
  sendSuccess(res, await service.listPlans());
}

export async function get(req: Request, res: Response) {
  sendSuccess(res, await service.getPlan(req.params.id));
}

export async function create(req: Request, res: Response) {
  const plan = await service.createPlan(req.body);
  await writeAudit(req, { action: 'plan.create', resource: 'Plan', resourceId: plan.id });
  sendCreated(res, plan);
}

export async function update(req: Request, res: Response) {
  const plan = await service.updatePlan(req.params.id, req.body);
  await writeAudit(req, { action: 'plan.update', resource: 'Plan', resourceId: plan.id });
  sendSuccess(res, plan);
}

export async function remove(req: Request, res: Response) {
  const plan = await service.softDeletePlan(req.params.id);
  await writeAudit(req, { action: 'plan.delete', resource: 'Plan', resourceId: plan.id });
  sendSuccess(res, plan);
}

export async function setFeatures(req: Request, res: Response) {
  const plan = await service.setPlanFeatures(req.params.id, req.body);
  await writeAudit(req, {
    action: 'plan.features.set',
    resource: 'Plan',
    resourceId: plan.id,
    metadata: req.body,
  });
  sendSuccess(res, plan);
}
