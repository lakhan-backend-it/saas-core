import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate';
import { requireRoles } from '../../../common/middleware/require-roles';
import { resolveTenant } from '../../../common/middleware/resolve-tenant';
import { asyncHandler } from '../../../common/middleware/async-handler';
import { sendSuccess } from '../../../common/http/api-response';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';

export const auditLogsRouter = Router();

auditLogsRouter.use(authenticate, resolveTenant);

auditLogsRouter.get(
  '/',
  requireRoles({ superAdmin: true, roles: ['TENANT_ADMIN'] }),
  asyncHandler(async (req, res) => {
    const where = req.user?.isSuperAdmin
      ? req.tenant
        ? { tenantId: req.tenant.id }
        : {}
      : { tenantId: req.user?.tenantId ?? undefined };

    if (!req.user?.isSuperAdmin && !where.tenantId) {
      throw AppError.badRequest('Tenant context required');
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        actor: { select: { id: true, email: true, fullName: true } },
      },
    });
    sendSuccess(res, logs);
  })
);
