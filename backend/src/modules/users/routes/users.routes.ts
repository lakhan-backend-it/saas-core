import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate';
import { requireRoles } from '../../../common/middleware/require-roles';
import { resolveTenant, requireTenant } from '../../../common/middleware/resolve-tenant';
import { validate } from '../../../common/middleware/validate.middleware';
import { asyncHandler } from '../../../common/middleware/async-handler';
import { idParamSchema } from '../../../common/schemas/id.schema';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import * as ctrl from '../controllers/users.controller';

export const usersRouter = Router();

usersRouter.use(
  authenticate,
  resolveTenant,
  requireTenant,
  requireRoles({ roles: ['TENANT_ADMIN'], superAdmin: true })
);

usersRouter.get('/', asyncHandler(ctrl.list));
usersRouter.post('/', validate({ body: createUserSchema }), asyncHandler(ctrl.create));
usersRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateUserSchema }),
  asyncHandler(ctrl.update)
);
