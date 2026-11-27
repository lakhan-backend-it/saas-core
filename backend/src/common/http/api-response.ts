import type { Response } from 'express';

/** Consistent success envelope — mirrors error envelope shape. */
export function sendSuccess<T>(
  res: Response,
  data: T,
  options: { status?: number; meta?: Record<string, unknown> } = {}
) {
  return res.status(options.status ?? 200).json({
    success: true,
    data,
    meta: options.meta,
    requestId: res.req.requestId,
  });
}

export function sendCreated<T>(res: Response, data: T) {
  return sendSuccess(res, data, { status: 201 });
}
