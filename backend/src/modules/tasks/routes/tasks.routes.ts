import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate';
import { resolveTenant, requireTenant } from '../../../common/middleware/resolve-tenant';
import { requireFeature } from '../../../common/middleware/require-feature';
import { validate } from '../../../common/middleware/validate.middleware';
import { asyncHandler } from '../../../common/middleware/async-handler';
import { idParamSchema } from '../../../common/schemas/id.schema';
import { FEATURES } from '../../../common/constants/features';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';
import * as ctrl from '../controllers/tasks.controller';

export const tasksRouter = Router();

tasksRouter.use(
  authenticate,
  resolveTenant,
  requireTenant,
  requireFeature(FEATURES.TASKS)
);

tasksRouter.get('/', asyncHandler(ctrl.list));
tasksRouter.post('/', validate({ body: createTaskSchema }), asyncHandler(ctrl.create));
tasksRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateTaskSchema }),
  asyncHandler(ctrl.update)
);
tasksRouter.delete('/:id', validate({ params: idParamSchema }), asyncHandler(ctrl.remove));
