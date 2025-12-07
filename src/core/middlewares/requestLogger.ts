import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Logger, { ILogger } from '../../infrastructure/logging/Logger';

export interface RequestWithLogger extends Request {
  requestId?: string;
  logger?: ILogger;
}

/**
 * Express middleware that attaches a request id and a child logger to the request.
 */
export function requestLogger(req: RequestWithLogger, res: Response, next: NextFunction): void {
  const incomingId = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = incomingId;
  res.setHeader('x-request-id', incomingId);

  const child = Logger.child({ requestId: incomingId, method: req.method, path: req.originalUrl });
  req.logger = child;

  const start = Date.now();
  child.info('request:start', { method: req.method, url: req.originalUrl });

  res.on('finish', () => {
    const duration = Date.now() - start;
    child.info('request:finish', { statusCode: res.statusCode, duration });
  });

  next();
}

export default requestLogger;
