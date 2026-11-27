import { Router } from 'express';
import { validate } from '../../../common/middleware/validate.middleware';
import { asyncHandler } from '../../../common/middleware/async-handler';
import { authenticate } from '../../../common/middleware/authenticate';
import { authRateLimit } from '../../../infrastructure/security/rate-limit';
import {
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
  switchTenantBodySchema,
} from '../schemas/auth.schema';
import * as authController from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post(
  '/register',
  authRateLimit,
  validate({ body: registerBodySchema }),
  asyncHandler(authController.register)
);

authRouter.post(
  '/login',
  authRateLimit,
  validate({ body: loginBodySchema }),
  asyncHandler(authController.login)
);

authRouter.post(
  '/refresh',
  authRateLimit,
  validate({ body: refreshBodySchema }),
  asyncHandler(authController.refresh)
);

authRouter.post(
  '/logout',
  validate({ body: logoutBodySchema }),
  asyncHandler(authController.logout)
);

authRouter.get('/me', authenticate, asyncHandler(authController.me));

authRouter.post(
  '/switch-tenant',
  authenticate,
  validate({ body: switchTenantBodySchema }),
  asyncHandler(authController.switchTenant)
);
