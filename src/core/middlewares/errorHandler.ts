import { Request, Response, NextFunction } from 'express';
import Logger from '../../infrastructure/logging/Logger';
import { RequestWithLogger } from './requestLogger';
import { AppError, isOperationalError } from '../errors/AppError';

/**
 * Global Express error handler.
 * Logs the error and returns a consistent JSON payload.
 * Handles both custom AppError instances and generic errors.
 */
export function errorHandler(err: unknown, req: RequestWithLogger, res: Response, _next: NextFunction): void {
  const logger = req?.logger ?? Logger;
  const requestId = req?.requestId;

  // Handle AppError instances
  if (err instanceof AppError) {
    const payload = {
      requestId,
      error: {
        message: err.message,
        code: err.code,
        ...(err.details ? { details: err.details } : {}),
      },
    };

    // Log based on severity
    if (err.statusCode >= 500) {
      logger.error('operational:error', { 
        requestId, 
        code: err.code, 
        status: err.statusCode, 
        message: err.message, 
        details: err.details,
        stack: err.stack,
        isOperational: err.isOperational
      });
    } else {
      logger.warn('client:error', { 
        requestId, 
        code: err.code, 
        status: err.statusCode, 
        message: err.message,
        details: err.details
      });
    }

    return sendResponse(res, err.statusCode, payload);
  }

  // Handle generic errors (fallback)
  const status = getStatusFromError(err);
  const message = getMessageFromError(err);
  const code = getCodeFromError(err);

  const payload: Record<string, unknown> = {
    requestId,
    error: {
      message,
      code,
    },
  };

  if (status >= 500) {
    logger.error('unhandled:error', { 
      requestId, 
      status, 
      message, 
      code,
      stack: (err as any)?.stack,
      errorType: err?.constructor?.name
    });
  } else {
    logger.warn('handled:error', { requestId, status, message, code });
  }

  sendResponse(res, status, payload);
}

/**
 * Safely send error response
 */
function sendResponse(res: Response, status: number, payload: any): void {
  try {
    if (!res.headersSent) {
      res.status(status).json(payload);
    }
  } catch (e) {
    Logger.error('error:response_failed', { error: String(e) });
  }
}

/**
 * Extract status code from error
 */
function getStatusFromError(err: unknown): number {
  if (err && typeof err === 'object') {
    if ('statusCode' in err && typeof (err as any).statusCode === 'number') {
      return (err as any).statusCode;
    }
    if ('status' in err && typeof (err as any).status === 'number') {
      return (err as any).status;
    }
  }
  return 500;
}

/**
 * Extract message from error
 */
function getMessageFromError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as any).message);
  }
  return 'Internal Server Error';
}

/**
 * Extract error code from error
 */
function getCodeFromError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err && typeof (err as any).code === 'string') {
    return (err as any).code;
  }
  return 'INTERNAL_ERROR';
}

export default errorHandler;
