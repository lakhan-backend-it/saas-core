import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate';
import { resolveTenant, requireTenant } from '../../../common/middleware/resolve-tenant';
import { asyncHandler } from '../../../common/middleware/async-handler';
import { sendSuccess } from '../../../common/http/api-response';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';

export const usageRouter = Router();

usageRouter.use(authenticate, resolveTenant, requireTenant);

usageRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    if (!req.tenant) throw AppError.badRequest('Tenant context required');
    const records = await prisma.usageRecord.findMany({
      where: { tenantId: req.tenant.id },
      orderBy: { periodStart: 'desc' },
    });
    sendSuccess(res, {
      features: req.tenant.features,
      limits: req.tenant.limits,
      records,
    });
  })
);
