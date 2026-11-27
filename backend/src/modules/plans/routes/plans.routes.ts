import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate';
import { requireRoles } from '../../../common/middleware/require-roles';
import { validate } from '../../../common/middleware/validate.middleware';
import { asyncHandler } from '../../../common/middleware/async-handler';
import { sendSuccess } from '../../../common/http/api-response';
import { prisma } from '../../../lib/prisma';
import { idParamSchema } from '../../../common/schemas/id.schema';
import {
  createPlanSchema,
  setPlanFeaturesSchema,
  updatePlanSchema,
} from '../schemas/plan.schema';
import * as ctrl from '../controllers/plans.controller';

export const plansRouter = Router();

plansRouter.get(
  '/catalog',
  authenticate,
  asyncHandler(async (_req, res) => {
    const plans = await prisma.plan.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true, code: true, description: true },
      orderBy: { name: 'asc' },
    });
    sendSuccess(res, plans);
  })
);

plansRouter.use(authenticate, requireRoles({ superAdmin: true }));

plansRouter.get('/', asyncHandler(ctrl.list));
plansRouter.get('/:id', validate({ params: idParamSchema }), asyncHandler(ctrl.get));
plansRouter.post('/', validate({ body: createPlanSchema }), asyncHandler(ctrl.create));
plansRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updatePlanSchema }),
  asyncHandler(ctrl.update)
);
plansRouter.delete('/:id', validate({ params: idParamSchema }), asyncHandler(ctrl.remove));
plansRouter.put(
  '/:id/features',
  validate({ params: idParamSchema, body: setPlanFeaturesSchema }),
  asyncHandler(ctrl.setFeatures)
);
