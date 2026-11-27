import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../../common/http/api-response';
import { writeAudit } from '../../../common/helpers/audit.helper';
import * as service from '../services/features.service';

export async function list(_req: Request, res: Response) {
  sendSuccess(res, await service.listFeatures());
}

export async function create(req: Request, res: Response) {
  const feature = await service.createFeature(req.body);
  await writeAudit(req, { action: 'feature.create', resource: 'Feature', resourceId: feature.id });
  sendCreated(res, feature);
}

export async function update(req: Request, res: Response) {
  const feature = await service.updateFeature(req.params.id, req.body);
  await writeAudit(req, { action: 'feature.update', resource: 'Feature', resourceId: feature.id });
  sendSuccess(res, feature);
}
