import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate';
import { requireRoles } from '../../../common/middleware/require-roles';
import { validate } from '../../../common/middleware/validate.middleware';
import { asyncHandler } from '../../../common/middleware/async-handler';
import { idParamSchema } from '../../../common/schemas/id.schema';
import { createFeatureSchema, updateFeatureSchema } from '../schemas/feature.schema';
import * as ctrl from '../controllers/features.controller';

export const featuresRouter = Router();

featuresRouter.use(authenticate, requireRoles({ superAdmin: true }));

featuresRouter.get('/', asyncHandler(ctrl.list));
featuresRouter.post('/', validate({ body: createFeatureSchema }), asyncHandler(ctrl.create));
featuresRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateFeatureSchema }),
  asyncHandler(ctrl.update)
);
