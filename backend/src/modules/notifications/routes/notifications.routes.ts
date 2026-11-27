import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate';
import { asyncHandler } from '../../../common/middleware/async-handler';
import { sendSuccess } from '../../../common/http/api-response';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';
import { idParamSchema } from '../../../common/schemas/id.schema';
import { validate } from '../../../common/middleware/validate.middleware';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const items = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    sendSuccess(res, items);
  })
);

notificationsRouter.post(
  '/:id/read',
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const item = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!item) throw AppError.notFound('Notification');
    const updated = await prisma.notification.update({
      where: { id: item.id },
      data: { isRead: true, readAt: new Date() },
    });
    sendSuccess(res, updated);
  })
);
