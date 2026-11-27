export type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TENANT_REQUIRED'
  | 'FEATURE_DISABLED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      code?: ErrorCode;
      isOperational?: boolean;
      details?: unknown;
      cause?: unknown;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = 'AppError';
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.isOperational = options.isOperational ?? true;
    this.details = options.details;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(message, { statusCode: 400, code: 'BAD_REQUEST', details });
  }

  static validation(message: string, details?: unknown) {
    return new AppError(message, { statusCode: 400, code: 'VALIDATION_ERROR', details });
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError(message, { statusCode: 401, code: 'UNAUTHORIZED' });
  }

  static forbidden(message = 'Insufficient permissions') {
    return new AppError(message, { statusCode: 403, code: 'FORBIDDEN' });
  }

  static notFound(resource = 'Resource') {
    return new AppError(`${resource} not found`, { statusCode: 404, code: 'NOT_FOUND' });
  }

  static conflict(message: string) {
    return new AppError(message, { statusCode: 409, code: 'CONFLICT' });
  }

  static featureDisabled(feature: string) {
    return new AppError(`Feature "${feature}" is not available on your plan`, {
      statusCode: 403,
      code: 'FEATURE_DISABLED',
      details: { feature },
    });
  }
}
