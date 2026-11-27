import pino from 'pino';
import { env } from '../../config/env';

/**
 * Structured JSON logger.
 * - production: JSON to stdout (ship to aggregator)
 * - development: pretty print for local DX
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: 'saas-core-api',
    env: env.NODE_ENV,
  },
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'authorization',
      'req.headers.authorization',
      'body.password',
      'body.currentPassword',
      'body.newPassword',
    ],
    remove: true,
  },
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
      : undefined,
});

export type Logger = typeof logger;
