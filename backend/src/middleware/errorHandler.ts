import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  type?: string;
}

/**
 * Global centralized error handler middleware.
 * Guarantees that internal errors, stack traces, database details,
 * and user data are never leaked to clients.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Handle payload too large (413)
  if (err.type === 'entity.too.large' || err.statusCode === 413) {
    logger.warn({ statusCode: 413, type: err.type }, 'Payload too large');
    res.status(413).json({
      success: false,
      message: 'Request payload too large. Request body must be under 16KB.',
      data: null,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload too large. Request body must be under 16KB.',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
    return;
  }

  // Handle CORS rejection (403)
  if (err.message === 'CORS_ORIGIN_NOT_ALLOWED') {
    logger.warn({ statusCode: 403 }, 'CORS origin rejected');
    res.status(403).json({
      success: false,
      message: 'Origin not allowed by CORS policy.',
      data: null,
      error: {
        code: 'CORS_FORBIDDEN',
        message: 'Origin not allowed by CORS policy.',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
    return;
  }

  // Handle malformed JSON body (400)
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
    logger.warn({ statusCode: 400 }, 'Malformed JSON body received');
    res.status(400).json({
      success: false,
      message: 'Invalid JSON payload in request body.',
      data: null,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON payload in request body.',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
    return;
  }

  // Handle rate limiting service unavailable (503)
  if (err.message === 'RATE_LIMIT_SERVICE_UNAVAILABLE') {
    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Please try again later.',
      data: null,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable. Please try again later.',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
    return;
  }

  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? (statusCode === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST');

  // Technical error logged safely without sensitive data
  logger.error(
    { statusCode, code, errorName: err.name, errorMessage: err.message },
    'Request error',
  );

  // Client receives clean, safe message
  const clientMessage =
    statusCode === 500
      ? 'Internal server error. Please try again later.'
      : err.message || 'An error occurred processing your request.';

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    data: null,
    error: {
      code,
      message: clientMessage,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  });
}
