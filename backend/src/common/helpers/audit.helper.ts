import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

export async function writeAudit(
  req: Request | null,
  input: {
    action: string;
    resource: string;
    resourceId?: string;
    tenantId?: string | null;
    metadata?: Prisma.InputJsonValue;
  }
) {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        tenantId: input.tenantId ?? req?.tenant?.id ?? req?.user?.tenantId ?? null,
        actorId: req?.user?.id ?? null,
        ip: req?.ip,
        userAgent: req?.get('user-agent') ?? undefined,
        metadata: input.metadata,
      },
    });
  } catch (err) {
    logger.warn({ err }, 'Failed to write audit log');
  }
}
