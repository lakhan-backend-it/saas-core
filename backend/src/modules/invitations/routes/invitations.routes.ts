import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate';
import { requireRoles } from '../../../common/middleware/require-roles';
import { resolveTenant, requireTenant } from '../../../common/middleware/resolve-tenant';
import { asyncHandler } from '../../../common/middleware/async-handler';
import * as ctrl from '../controllers/invitations.controller';

export const invitationsRouter = Router();

invitationsRouter.post('/accept', asyncHandler(ctrl.accept));

invitationsRouter.use(
  authenticate,
  resolveTenant,
  requireTenant,
  requireRoles({ roles: ['TENANT_ADMIN'], superAdmin: true })
);

invitationsRouter.get('/', asyncHandler(ctrl.list));
invitationsRouter.post('/', asyncHandler(ctrl.create));
