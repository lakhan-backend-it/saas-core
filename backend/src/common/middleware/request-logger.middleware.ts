import type { RequestHandler } from 'express';
import { logger } from '../../lib/logger';

/** Access log with latency — skip noisy health probes in prod if needed. */
export const requestLoggerMiddleware: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const payload = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      userId: req.user?.id,
      tenantId: req.tenant?.id,
    };

    if (res.statusCode >= 500) {
      logger.error(payload, 'request completed');
    } else if (res.statusCode >= 400) {
      logger.warn(payload, 'request completed');
    } else if (req.originalUrl.startsWith('/api/v1/health')) {
      logger.debug(payload, 'request completed');
    } else {
      logger.info(payload, 'request completed');
    }
  });

  next();
};
