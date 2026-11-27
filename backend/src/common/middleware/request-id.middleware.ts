import type { RequestHandler } from 'express';
import { randomUUID } from 'crypto';

/** Correlate logs, responses, and client bug reports. */
export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const incoming = req.header('x-request-id');
  const requestId = incoming && incoming.length <= 64 ? incoming : randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};
