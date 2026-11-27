import type { Request, Response } from 'express';
import { z } from 'zod';
import { sendCreated, sendSuccess } from '../../../common/http/api-response';
import { writeAudit } from '../../../common/helpers/audit.helper';
import { AppError } from '../../../common/errors/app-error';
import * as service from '../services/invitations.service';

const createSchema = z.object({
  email: z.string().email(),
  role: z.enum(['TENANT_ADMIN', 'TENANT_USER']).default('TENANT_USER'),
});

const acceptSchema = z.object({
  token: z.string().min(20),
  fullName: z.string().min(2).max(120),
  password: z.string().min(8).max(128),
});

export async function list(req: Request, res: Response) {
  if (!req.tenant) throw AppError.badRequest('Tenant context required');
  sendSuccess(res, await service.listInvitations(req.tenant.id));
}

export async function create(req: Request, res: Response) {
  if (!req.tenant) throw AppError.badRequest('Tenant context required');
  const body = createSchema.parse(req.body);
  const result = await service.createInvitation({
    tenantId: req.tenant.id,
    email: body.email,
    role: body.role,
    invitedById: req.user?.id,
  });
  await writeAudit(req, {
    action: 'invitation.create',
    resource: 'Invitation',
    resourceId: result.invitation.id,
    tenantId: req.tenant.id,
  });
  sendCreated(res, {
    invitation: result.invitation,
    acceptUrl: result.acceptUrl,
  });
}

export async function accept(req: Request, res: Response) {
  const body = acceptSchema.parse(req.body);
  const result = await service.acceptInvitation(body);
  sendSuccess(res, result);
}
