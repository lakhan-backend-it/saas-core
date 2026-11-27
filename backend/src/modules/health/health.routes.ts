import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../common/middleware/async-handler';
import { sendSuccess } from '../../common/http/api-response';

export const healthRouter = Router();

healthRouter.get(
  '/live',
  asyncHandler(async (_req, res) => {
    sendSuccess(res, { status: 'ok' });
  })
);

healthRouter.get(
  '/ready',
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(res, { status: 'ready', db: 'up' });
  })
);
