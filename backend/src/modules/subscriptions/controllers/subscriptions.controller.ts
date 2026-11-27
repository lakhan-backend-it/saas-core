import type { Request, Response } from 'express';
import { sendSuccess } from '../../../common/http/api-response';
import { writeAudit } from '../../../common/helpers/audit.helper';
import * as service from '../services/subscriptions.service';

export async function list(_req: Request, res: Response) {
  sendSuccess(res, await service.listSubscriptions());
}

export async function assign(req: Request, res: Response) {
  const sub = await service.assignSubscription(req.body);
  await writeAudit(req, {
    action: 'subscription.assign',
    resource: 'Subscription',
    resourceId: sub.id,
    tenantId: sub.tenantId,
    metadata: { planId: sub.planId },
  });
  sendSuccess(res, sub);
}
