import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate';
import { resolveTenant, requireTenant } from '../../../common/middleware/resolve-tenant';
import { requireFeature } from '../../../common/middleware/require-feature';
import { validate } from '../../../common/middleware/validate.middleware';
import { asyncHandler } from '../../../common/middleware/async-handler';
import { idParamSchema } from '../../../common/schemas/id.schema';
import { FEATURES } from '../../../common/constants/features';
import { createProjectSchema, updateProjectSchema } from '../schemas/project.schema';
import * as ctrl from '../controllers/projects.controller';

export const projectsRouter = Router();

projectsRouter.use(
  authenticate,
  resolveTenant,
  requireTenant,
  requireFeature(FEATURES.PROJECTS)
);

projectsRouter.get('/', asyncHandler(ctrl.list));
projectsRouter.post('/', validate({ body: createProjectSchema }), asyncHandler(ctrl.create));
projectsRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateProjectSchema }),
  asyncHandler(ctrl.update)
);
projectsRouter.delete('/:id', validate({ params: idParamSchema }), asyncHandler(ctrl.remove));
