import type { RequestHandler, Request, Response, NextFunction } from 'express';

/** Wrap async controllers so rejections hit the central error handler. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
