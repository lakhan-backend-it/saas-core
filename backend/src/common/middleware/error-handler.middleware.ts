import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { logger } from '../../lib/logger';
import { env } from '../../config/env';

function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): AppError {
  switch (err.code) {
    case 'P2002':
      return AppError.conflict('A record with this value already exists');
    case 'P2025':
      return AppError.notFound();
    case 'P2003':
      return AppError.badRequest('Related record not found');
    default:
      return new AppError('Database error', {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        isOperational: false,
        cause: err,
      });
  }
}

/**
 * Central error boundary — never leak stack traces in production.
 * Always returns a stable JSON contract for the frontend & API clients.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = req.requestId;

  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof ZodError) {
    appError = AppError.validation('Validation failed', err.flatten());
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    appError = mapPrismaError(err);
  } else {
    appError = new AppError('Internal server error', {
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      isOperational: false,
      cause: err,
    });
  }

  const logPayload = {
    requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode: appError.statusCode,
    code: appError.code,
    err: appError,
    userId: req.user?.id,
    tenantId: req.tenant?.id,
  };

  if (appError.statusCode >= 500) {
    logger.error(logPayload, appError.message);
  } else {
    logger.warn(logPayload, appError.message);
  }

  res.status(appError.statusCode).json({
    success: false,
    code: appError.code,
    message: appError.message,
    details: appError.details ?? undefined,
    requestId,
    ...(env.NODE_ENV !== 'production' && !appError.isOperational
      ? { stack: appError.stack }
      : {}),
  });
};
