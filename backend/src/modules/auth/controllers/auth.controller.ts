import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../../common/http/api-response';
import { AppError } from '../../../common/errors/app-error';
import * as authService from '../services/auth.service';
import type {
  LoginBody,
  RegisterBody,
} from '../schemas/auth.schema';

export async function register(req: Request, res: Response) {
  const body = req.body as RegisterBody;
  const result = await authService.register(body);
  return sendCreated(res, result);
}

export async function login(req: Request, res: Response) {
  const body = req.body as LoginBody;
  const result = await authService.login(body);
  return sendSuccess(res, result);
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken: string };
  const result = await authService.refresh(refreshToken);
  return sendSuccess(res, result);
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken: string };
  const result = await authService.logout(refreshToken);
  return sendSuccess(res, result);
}

export async function me(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const result = await authService.me(req.user.id, req.user.tenantId);
  return sendSuccess(res, result);
}

export async function switchTenant(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const { tenantId } = req.body as { tenantId: string };
  const result = await authService.switchTenant(
    req.user.id,
    tenantId,
    req.user.isSuperAdmin
  );
  return sendSuccess(res, result);
}
