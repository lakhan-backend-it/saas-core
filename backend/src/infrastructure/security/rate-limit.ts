import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';
import { AppError } from '../../common/errors/app-error';

const skipInTest = () => env.NODE_ENV === 'test';

export const rateLimitMiddleware = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: (_req, _res, next) => {
    next(
      new AppError('Too many requests', {
        statusCode: 429,
        code: 'RATE_LIMITED',
      })
    );
  },
});

/** Stricter bucket for auth endpoints (brute-force resistance). */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: (_req, _res, next) => {
    next(
      new AppError('Too many auth attempts', {
        statusCode: 429,
        code: 'RATE_LIMITED',
      })
    );
  },
});
