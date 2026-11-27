import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate';
import { requireRoles } from '../../../common/middleware/require-roles';
import { validate } from '../../../common/middleware/validate.middleware';
import { asyncHandler } from '../../../common/middleware/async-handler';
import { assignSubscriptionSchema } from '../schemas/subscription.schema';
import * as ctrl from '../controllers/subscriptions.controller';

export const subscriptionsRouter = Router();

subscriptionsRouter.use(authenticate, requireRoles({ superAdmin: true }));

subscriptionsRouter.get('/', asyncHandler(ctrl.list));
subscriptionsRouter.post(
  '/assign',
  validate({ body: assignSubscriptionSchema }),
  asyncHandler(ctrl.assign)
);
