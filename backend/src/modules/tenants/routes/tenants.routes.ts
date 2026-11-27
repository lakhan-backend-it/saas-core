import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate';
import { requireRoles } from '../../../common/middleware/require-roles';
import { validate } from '../../../common/middleware/validate.middleware';
import { asyncHandler } from '../../../common/middleware/async-handler';
import { idParamSchema } from '../../../common/schemas/id.schema';
import { createTenantSchema, updateTenantSchema } from '../schemas/tenant.schema';
import * as ctrl from '../controllers/tenants.controller';

export const tenantsRouter = Router();

tenantsRouter.use(authenticate);

tenantsRouter.get('/', requireRoles({ superAdmin: true }), asyncHandler(ctrl.list));
tenantsRouter.post(
  '/',
  requireRoles({ superAdmin: true }),
  validate({ body: createTenantSchema }),
  asyncHandler(ctrl.create)
);
tenantsRouter.get('/:id', validate({ params: idParamSchema }), asyncHandler(ctrl.get));
tenantsRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateTenantSchema }),
  asyncHandler(ctrl.update)
);
tenantsRouter.delete(
  '/:id',
  requireRoles({ superAdmin: true }),
  validate({ params: idParamSchema }),
  asyncHandler(ctrl.remove)
);
