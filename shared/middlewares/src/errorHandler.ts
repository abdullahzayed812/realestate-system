import { Request, Response, NextFunction } from 'express';
import { AppError } from '@realestate/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
    });
  }

  // MySQL duplicate entry
  if ((err as NodeJS.ErrnoException).code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      code: 'CONFLICT',
      message: 'Resource already exists',
      timestamp: new Date().toISOString(),
    });
  }

  // Log unexpected errors
  console.error('[ErrorHandler] Unhandled error:', err);

  return res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString(),
  });
}
