import { Request, Response, NextFunction } from 'express';
import Logger from '../../infrastructure/logging/Logger';
import { RequestWithLogger } from './requestLogger';

/**
 * Global Express error handler.
 * Logs the error and returns a consistent JSON payload.
 */
export function errorHandler(err: unknown, req: RequestWithLogger, res: Response, _next: NextFunction): void {
  const logger = req?.logger ?? Logger;
  const requestId = req?.requestId;

  const status = (err && typeof err === 'object' && 'statusCode' in err && (err as any).statusCode) ||
    (err && typeof err === 'object' && 'status' in err && (err as any).status) || 500;

  const message = (err && typeof err === 'object' && 'message' in err && (err as any).message) || 'Internal Server Error';
  const code = (err && typeof err === 'object' && 'code' in err && (err as any).code) || 'INTERNAL_ERROR';
  const details = (err && typeof err === 'object' && 'details' in err && (err as any).details) || undefined;

  const payload: Record<string, unknown> = {
    requestId,
    error: {
      message,
      code,
      ...(details ? { details } : {}),
    },
  };

  if (Number(status) >= 500) {
    logger.error('unhandled:error', { requestId, status, message, stack: (err as any)?.stack });
  } else {
    logger.warn('handled:error', { requestId, status, message });
  }

  try {
    res.status(Number(status)).json(payload);
  } catch (e) {
    // In rare cases sending the response fails — log at least
    logger.error('error:response_failed', { requestId, err: String(e) });
  }
}

export default errorHandler;
